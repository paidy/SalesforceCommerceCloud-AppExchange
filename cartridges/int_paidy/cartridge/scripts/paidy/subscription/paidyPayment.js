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
var logger = Logger.getLogger('Paidy', 'PAIDY');

/**
 * Get a total amount of order
 * @param {Object} order - The order object passed to paidyPay
 * @returns {number} Returns price value
 */
function getAmount(order) {
    return order.totalGrossPrice.available ?
        order.totalGrossPrice.value :
        order.getAdjustedMerchandizeTotalPrice(true).add(order.giftCertificateTotalPrice).value;
}

/**
 * create a Paidy subscription payment
 * @param {Object} order - The order object passed to paidyPay
 * @param {Object} customer - The customer object extracted by getCustomer() from order object
 * @returns {Object} Returns data required for Paidy API request
 */
function getPaidyData(order, customer) {
    var currentSite = Site.getCurrent();
    var buyerData = {};
    var orderData = {};
    var shippingAddress = {};

    var tokenId = customer && customer.profile.custom.paidyToken;

    var amount = getAmount(order);
    var currency = 'JPY';
    var storeName = currentSite.getCustomPreferenceValue('paidy_store_name');

    // Buyer data
    var now = new Date();
    buyerData = customer && utils.getBuyerData(customer, now);

    // Order
    var productLineItems = order.allProductLineItems;
    var items = [];
    var shipping = order.adjustedShippingTotalPrice.available ? order.adjustedShippingTotalPrice.value : order.shippingTotalPrice.value;
    var product = null;
    productLineItems.toArray().forEach(function (pLineItem) {
        // get product from product id
        product = ProductMgr.getProduct(pLineItem.productID);
        var paidyItemUnitPrice = (pLineItem.quantityValue === 0) ? pLineItem.adjustedPrice.value : pLineItem.adjustedPrice.value / pLineItem.quantityValue;
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
    orderAddress = (order.defaultShipment.gift) ? order.billingAddress : order.defaultShipment.shippingAddress;
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
 * @param {Object} pdict - The object containing order. Order object is obtained from cart.createOrder()
 * @param {string} paidyId - The ID stored in response information from Paidy API
 * @returns {Object} Returns execution result
 */
function paidyPay(pdict, paidyId) {
    var result = new Status(Status.ERROR, 'paidy.payment.error.authorize');

    // get current order
    var currentOrder = pdict.Order;

    try {
        // the standard payment API path includes "paidyPaymentId" at the end
        var paidyPaymentId = paidyId ? '/' + paidyId : '';

        // payment method api path - paidy
        var payMethod = '/payments' + paidyPaymentId;

        var customer = empty(paidyId) && currentOrder.getCustomer();
        var dataPost = getPaidyData(currentOrder, customer);
        var serviceName = Site.getCurrent().getCustomPreferenceValue('paidy_service_name');

        // standard payments should send a "GET" request. And subscription payments should send a "POST" request.
        var method = paidyId ? CallService.ServiceType.get : CallService.ServiceType.post;
        var response = null;

        var service = {
            name: serviceName,
            url: payMethod,
            method: method,
            data: dataPost,
            isStringify: true
        };

        var log = {
            category: 'Paidy',
            method: 'Create subscription payment',
            process: 'Payment',
            orderNo: currentOrder.getOrderNo()
        };

        response = CallService.callService(service, log);

        if (!empty(response)) {
            switch (response.status) {
                case 'authorized':
                    result = new Status(Status.OK);
                    result.addDetail('PaymentId', response.id);
                    result.addDetail('ResultPaidy', JSON.stringify(response));
                    break;
                case 'rejected':
                    result = new Status(Status.ERROR, 'paidy.payment.error.rejected');
                    break;
                case 'closed':
                    break;
                default:
                    break;
            }
        }
    } catch (e) {
        logger.error(
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
