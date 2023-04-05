/* eslint-disable no-undef */
'use strict';

/**
 * Controller that renders the account overview, manages customer registration
 * and password reset, and edits customer profile information.
 *
 * @module controllersPAIDY_STANDARD
 */

/* API includes */
var OrderMgr = require('dw/order/OrderMgr');
var log = require('dw/system/Logger').getLogger('Paidy', 'PAIDY');

/* Script Modules */
var app = require(require('*/package.json').controllers +
  '/cartridge/scripts/app');
var guard = require(require('*/package.json').controllers +
  '/cartridge/scripts/guard');

var Transaction = require('dw/system/Transaction');

/**
 * Renders the paidy/authorize/get-paidy-config template.
 */
function getPaidyConfig() {
    var paidyCartridge = require('*/package.json').paidyCartridge;
    var currentForms = session.forms;
    var responseJson = require(paidyCartridge +
    '/cartridge/scripts/paidy/standard/authorize').getPaidyConfig(
        currentForms.billing.paymentMethods.selectedPaymentMethodID.value
    );

    app
        .getView({
            JSONResponse: responseJson
        })
        .render('util/responsejson');
}

/**
 * Returns the address of the template to be displayed at the time of order
 * failure.
 */
function failOrder() {
    var orderData = OrderMgr.getOrder(
        request.httpParameterMap.orderNo.value,
        request.httpParameterMap.orderToken.value
    );
    if (!orderData) {
        app
          .getView({
              JSONResponse: {
                  success: false,
                  error: 'Order Data Is Null'
              }
          })
          .render('util/responsejson');
    }
    var FailOrderResult = null;

    Transaction.wrap(function () {
        FailOrderResult = OrderMgr.failOrder(orderData, true);
    });

    if (!FailOrderResult) {
        app
            .getView({
                JSONResponse: {
                    success: false,
                    error: FailOrderResult.getCode()
                }
            })
            .render('util/responsejson');
    } else {
        app
            .getView({
                // JSONResponse: {
                // status: 200,
                // order: order || ''
                // }
                JSONResponse: {
                    status: 200
                }
            })
            .render('util/responsejson');
    }
}

/**
 * Paidy (standard) Process to finalize an order with payment.
 * @returns {Object} Returns the defined cartridge COPlaceOrder-Submit
 */
function placeOrder() {
    var paidyCartridge = require('*/package.json').paidyCartridge;
    var placeOrderResult = require(paidyCartridge +
    '/cartridge/scripts/paidy/standard/authorize').validationPlaceOrder(
        request.httpParameterMap.payloadToPaidy.stringValue,
        request.httpParameterMap.paidyResult.stringValue
    );
    var orderToken = (function () {
        try {
            var payloadToPaidy = JSON.parse(
               request.httpParameterMap.payloadToPaidy.stringValue
            );
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
        return {
            error: true
        };
    }
    var orderData = OrderMgr.getOrder(
        request.httpParameterMap.orderNo.value,
        orderToken
    );
    if (!orderData) {
        return {
            error: true
        };
    }
    var paidyPaymetId = JSON.parse(request.httpParameterMap.paidyResult).id;

    if (!placeOrderResult) {
        var FailOrderResult = null;

        Transaction.wrap(function () {
            FailOrderResult = OrderMgr.failOrder(orderData, true);
        });

        if (!FailOrderResult) {
            return {
                error: true
            };
        }
        return {
            error: true
        };
    }
    Transaction.wrap(function () {
        orderData.custom.paidyPaymentId = paidyPaymetId;
    });

    return require(require('*/package.json').controllers +
      // eslint-disable-next-line new-cap
      '/cartridge/controllers/COPlaceOrder').Submit();
}

/* Web exposed methods */

/**
 * Renders the paidy/authorize/get-paidy-config.
 *
 * @see {@link module:controllers/PAIDY_STANDARD~getPaidyConfig}
 */
exports.GetPaidyConfig = guard.ensure(['https', 'get'], getPaidyConfig);
/**
 * Returns the address of the template to be displayed at the time of order
 * failure.
 *
 * @see {@link module:controllers/PAIDY_STANDARD~failOrder}
 */
exports.FailOrder = guard.ensure(['https', 'get', 'csrf'], failOrder);
/**
 * Paidy (standard) Process to finalize an order with payment.
 *
 * @see {@link module:controllers/PAIDY_STANDARD~placeOrder}
 */
exports.PlaceOrder = guard.ensure(['https', 'post', 'csrf'], placeOrder);
