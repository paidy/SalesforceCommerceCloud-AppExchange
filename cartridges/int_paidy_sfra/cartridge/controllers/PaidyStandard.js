'use strict';

/**
 * Controller that renders the account overview, manages customer registration
 * and password reset, and edits customer profile information.
 *
 * @module controllersPAIDY_STANDARD
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Preferences = require('*/cartridge/scripts/object/preferences');

/* API includes */
var OrderMgr = require('dw/order/OrderMgr');
var BasketMgr = require('dw/order/BasketMgr');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var log = require('dw/system/Logger').getLogger('Paidy', 'PAIDY');

/**
 * Renders the paidy/authorize/get-paidy-config template.
 */
server.get('GetPaidyConfig', server.middleware.https, function (req, res, next) {
    var PaymentType = Preferences.PaymentType.paidyStandard;
    var responseJson = require('*/cartridge/scripts/paidy/standard/authorize').getPaidyConfig(PaymentType);

    res.json(responseJson);
    next();
});

/**
 * Returns the address of the template to be displayed at the time of order
 * failure.
 */
server.get(
    'FailOrder',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var orderData = OrderMgr.getOrder(
            req.querystring.orderNo,
            req.querystring.orderToken
        );
        if (!orderData) {
            res.json({
                success: false,
                error: Resource.msg('error.orderDataIsNull', 'paidy', null)
            });
            return next();
        }
        var FailOrderResult = null;

        Transaction.wrap(function () {
            FailOrderResult = OrderMgr.failOrder(orderData, true);
        });

        if (!FailOrderResult) {
            res.json({
                success: false,
                error: FailOrderResult.getCode()
            });
        } else {
            res.json({
                status: 200
            });
        }
        return next();
    }
);

/**
 * Paidy (standard) Process to finalize an order with payment.
 */
server.get(
    'PlaceOrder',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

        var currentBasket = BasketMgr.getCurrentBasket();
        var validationPlaceOrderResult = require('*/cartridge/scripts/paidy/standard/authorize').validationPlaceOrder(
            req.querystring.payloadToPaidy,
            req.querystring.paidyResult
        );

        var orderToken = (function () {
            try {
                var payloadToPaidy = JSON.parse(req.querystring.payloadToPaidy);
                if (
                    payloadToPaidy &&
                    payloadToPaidy.order &&
                    payloadToPaidy.order.order_token
                ) {
                    return payloadToPaidy.order.order_token;
                }
            } catch (e) {
                log.error('An error when getting orderToken: {0}', e);
            }
            return null;
        }());
        if (!orderToken) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.invalidToken', 'paidy', null)
            });
            return next();
        }
        var orderData = OrderMgr.getOrder(req.querystring.orderNo, orderToken);
        if (!orderData) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.orderDataIsNull', 'paidy', null)
            });
            return next();
        }
        var paidyPaymetId = JSON.parse(req.querystring.paidyResult).id;

        if (!validationPlaceOrderResult) {
            Transaction.wrap(function () {
                OrderMgr.failOrder(orderData, true);
            });

            res.json({
                error: true,
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });

            return next();
        }

        Transaction.wrap(function () {
            orderData.custom.paidyPaymentId = paidyPaymetId;
        });

        var fraudDetectionStatus = hooksHelper(
            'app.fraud.detection',
            'fraudDetection',
            currentBasket,
            require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection
        );


        if (fraudDetectionStatus.status === 'fail') {
            Transaction.wrap(function () {
                OrderMgr.failOrder(orderData, true);
            });

            // fraud detection failed
            req.session.privacyCache.set('fraudDetectionStatus', true);

            res.json({
                error: true,
                cartError: true,
                redirectUrl: URLUtils.url(
                    'Error-ErrorCode',
                    'err',
                    fraudDetectionStatus.errorCode
                ).toString(),
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });

            return next();
        }

        // Places the order
        var placeOrderResult = COHelpers.placeOrder(
            orderData,
            fraudDetectionStatus
        );
        if (placeOrderResult.error) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }

        if (req.currentCustomer.addressBook) {
            // save all used shipping addresses to address book of the logged in customer
            var allAddresses = addressHelpers.gatherShippingAddresses(orderData);
            allAddresses.forEach(function (address) {
                if (
                    !addressHelpers.checkIfAddressStored(
                        address,
                        req.currentCustomer.addressBook.addresses
                    )
                ) {
                    addressHelpers.saveAddress(
                        address,
                        req.currentCustomer,
                        addressHelpers.generateAddressName(address)
                    );
                }
            });
        }

        COHelpers.sendConfirmationEmail(orderData, req.locale.id);

        // Reset usingMultiShip after successful Order placement
        req.session.privacyCache.set('usingMultiShipping', false);

        res.json({
            error: false,
            orderID: orderData.orderNo,
            orderToken: orderData.orderToken,
            continueUrl: URLUtils.url('Order-Confirm').toString()
        });
        return next();
    }
);

module.exports = server.exports();
