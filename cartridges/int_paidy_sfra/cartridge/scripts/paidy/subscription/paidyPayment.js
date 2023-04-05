/* eslint-disable no-undef */
/**
 *
 * This script attempts to make a payment by using Paidy Subscription method.
 *
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var TaxMgr = require('dw/order/TaxMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Money = require('dw/value/Money');

var CallService = require('*/cartridge/scripts/paidy/subscription/callService');

var utils = require('*/cartridge/scripts/paidy/paidyUtils');
var log = Logger.getLogger('Paidy', 'PAIDY');

/**
 * Get a total amount of order
 * @param {Object} order - The order object passed to paidyPay
 * @returns {number} Returns price value
 */
function getAmount(order) {
    return order.totalGrossPrice.available
        ? order.totalGrossPrice.value
        : order
            .getAdjustedMerchandizeTotalPrice(true)
            .add(order.giftCertificateTotalPrice).value;
}

/**
 * create a Paidy subscription payment
 * @param {Object} order - The order object passed to paidyPay
 * @param {Object} customer - The customer object extracted by getCustomer() from order object
 * @param {string} paidyToken - The tokenId issued by Paidy
 * @returns {Object} Returns data required for Paidy API request
 */
function getPaidyData(order, customer, paidyToken) {
    var currentSite = Site.getCurrent();
    var buyerData = {};
    var orderData = {};
    var shippingAddress = {};

    var tokenId = paidyToken;

    var amount = getAmount(order);
    var currency = 'JPY';
    var storeName = currentSite.getCustomPreferenceValue('paidy_store_name');

    // Buyer data
    var now = new Date();
    buyerData = utils.getBuyerData(customer, now);

    // Order
    var productLineItems = order.allProductLineItems;
    var items = [];
    var shipping = order.adjustedShippingTotalPrice.available
        ? order.adjustedShippingTotalPrice.value
        : order.shippingTotalPrice.value;
    var product = null;
    productLineItems.toArray().forEach(function (pLineItem) {
    // get product from product id
        product = ProductMgr.getProduct(pLineItem.productID);
        var paidyItemUnitPrice =
      pLineItem.quantityValue === 0
          ? pLineItem.adjustedPrice.value
          : pLineItem.adjustedPrice.value / pLineItem.quantityValue;
        items.push({
            id: pLineItem.productID,
            quantity: pLineItem.quantityValue,
            title: pLineItem.productName,
            unit_price: paidyItemUnitPrice,
            description: product.getPageDescription()
        });
    });

    var orderRef = order.orderNo;
    var totalTax = 0;
    if ((TaxMgr.getTaxationPolicy() === TaxMgr.TAX_POLICY_NET) && order.totalTax.available) {
        totalTax = order.totalTax.value;
    }

    orderData = {
        items: items,
        order_ref: orderRef,
        shipping: shipping,
        tax: totalTax
    };

    // apply coupon code
    var totalExclOrderDiscounts = order.getAdjustedMerchandizeTotalPrice(false);
    var totalInclOrderDiscounts = order.getAdjustedMerchandizeTotalPrice(true);
    var orderDiscount = totalExclOrderDiscounts.subtract(totalInclOrderDiscounts);
    if (!empty(orderDiscount) && orderDiscount.value > 0.0) {
        items.push({
            quantity: 1,
            unit_price: -orderDiscount.value
        });
    }

    // apply gift certificate code
    var giftCode = new Money(0, 'JPY');
    var paymentInstruments = order.getPaymentInstruments().iterator();
    while (paymentInstruments.hasNext()) {
        var paymentIntrument = paymentInstruments.next();
        // Paidy決済を除いた注文総数を計算で出力する。
        if (paymentIntrument.paymentMethod.toUpperCase().indexOf('PAIDY') !== 0) {
            giftCode = giftCode.add(paymentIntrument.paymentTransaction.amount);
        }
    }

    if (giftCode.value > 0) {
        orderData.items.push({
            quantity: 1,
            unit_price: -giftCode.value
        });
        amount -= giftCode.value;
    }

    // get shipping address
    // gift: Set order.billingAddress
    // not gift: Set order.defaultShipment.shippingAddress
    var orderAddress = null;
    orderAddress = order.defaultShipment.gift
        ? order.billingAddress
        : order.defaultShipment.shippingAddress;
    shippingAddress = {
        line1: orderAddress.address2,
        line2: orderAddress.address1 || '',
        city: orderAddress.city,
        state: orderAddress.stateCode,
        zip: orderAddress.postalCode
    };

    var paidyData = {};
    if (storeName != null) {
        paidyData = {
            token_id: tokenId,
            amount: amount,
            currency: currency,
            store_name: storeName,
            buyer_data: buyerData,
            order: orderData,
            shipping_address: shippingAddress
        };
    } else {
        paidyData = {
            token_id: tokenId,
            amount: amount,
            currency: currency,
            buyer_data: buyerData,
            order: orderData,
            shipping_address: shippingAddress
        };
    }

    return paidyData;
}

/**
 * Eexecute the CallService, defined it's results and return
 * @param {Object} currentOrder - The order object created by COHelpers.createOrder (currentBasket) in controllers/CheckoutService
 * @param {string} paidyToken - The tokenId issued by Paidy
 * @returns {Object} Returns execution result
 */
function paidyPay(currentOrder, paidyToken) {
    var result = new Status(
        Status.ERROR,
        'paidy.payment.error.authorize'
    );

    try {
        // payment method api path - paidy
        var payMethod = '/payments';

        // get current order
        var customer = currentOrder.getCustomer();
        var dataPost = getPaidyData(currentOrder, customer, paidyToken);
        var serviceName = Site.getCurrent().getCustomPreferenceValue(
            'paidy_service_name'
        );
        var method = CallService.ServiceType.post;
        var response = null;

        var service = {
            name: serviceName,
            url: payMethod,
            method: method,
            data: dataPost,
            isStringify: true
        };

        var logSetting = {
            category: 'Paidy',
            method: 'Create subscription payment',
            process: 'Payment',
            orderNo: currentOrder.getOrderNo()
        };

        response = CallService.callService(service, logSetting);

        if (!empty(response)) {
            switch (response.status) {
                case 'authorized':
                    result = new Status(Status.OK);
                    result.addDetail('PaymentId', response.id);
                    result.addDetail('ResultPaidy', JSON.stringify(response));
                    break;
                case 'rejected':
                    result = new Status(
                    Status.ERROR,
                    'paidy.payment.error.rejected'
                );
                    break;
                case 'closed':
                    break;
                default:
                    break;
            }
        }
    } catch (e) {
        log.error(
            'An error occurred in paidyPay. Error message:' +
        e.toString() +
        '\norderNo:' +
        currentOrder.getOrderNo()
        );
    }
    return result;
}

module.exports = {
    paidyPay: paidyPay
};
