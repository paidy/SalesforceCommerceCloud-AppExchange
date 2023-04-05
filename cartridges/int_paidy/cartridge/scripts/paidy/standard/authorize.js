/* eslint-disable no-undef */
'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var ProductLineItem = require('dw/order/ProductLineItem');
var TaxMgr = require('dw/order/TaxMgr');
var OrderPaymentInstrument = require('dw/order/OrderPaymentInstrument');
var ProductMgr = require('dw/catalog/ProductMgr');
var Site = require('dw/system/Site');
var Resource = require('dw/web/Resource');
var Money = require('dw/value/Money');
var utils = require('*/cartridge/scripts/paidy/paidyUtils');
var Preferences = require('*/cartridge/scripts/object/preferences');
var Logger = require('dw/system/Logger');
var log = Logger.getLogger('Paidy', 'PAIDY');
var paidyPaymentAPI = require('*/cartridge/scripts/paidy/subscription/paidyPayment');

/**
 * Get the Paidy payment settings
 * @param {string} payment - The selected payment method
 * @returns {Object} Returns standard settlement config data
 */
function getPaidyConfig(payment) {
    return {
        api_key: Site.getCurrent().getCustomPreferenceValue(
            'paidy_api_key'
        ),
        logo_url:
      Site.getCurrent().getCustomPreferenceValue('paidy_logo_url') ||
      '',
        metadata: {
            Platform: 'Salesforce Commerce Cloud'
        },
        closed: 'Replace this with a callback func. (callbackData) => {...}',
        payment_method: payment,
        submit_button: '.submit-order button[type="submit"]',
        timeout:
      +Site.getCurrent().getCustomPreferenceValue(
          'paidy_time_out_second'
      ) || 300,
        messages: {
            errors: {
                timeout: Resource.msg(
                    'paidy.payment.error.timeout',
                    'checkout',
                    null
                ),
                authorize: Resource.msg(
                    'paidy.payment.error.authorize',
                    'checkout',
                    null
                ),
                rejected_short: Resource.msg(
                    'paidy.payment.error.rejected',
                    'checkout',
                    null
                )
            }
        }
    };
}

/**
 * Aggregation of purchased products
 * @param {Object} order - The order object created from cart at the time of settlement
 * @returns {Object} Returns the "items" information required for the request to Paidy Checkout
 */
function collectItems(order) {
    var xs = [];
    // var it = order.shippingOrderItems.iterator();
    var it = order.allLineItems.iterator();
    while (it.hasNext()) {
        var item = it.next();
        if (item instanceof ProductLineItem) {
            var product = ProductMgr.getProduct(item.productID);
            var paidyItemUnitPrice =
        item.quantity.value === 0
            ? item.adjustedPrice.value
            : item.adjustedPrice.value / item.quantity.value;
            xs.push({
                id: item.productID,
                quantity: item.quantity.value,
                title: item.productName,
                unit_price: paidyItemUnitPrice,
                description: product.getPageDescription()
            });
        }
    }

    // components/order/ordertotal.isml@storefront_core と同じロジック
    var merchTotalExclOrderDiscounts = order.getAdjustedMerchandizeTotalPrice(
        false
    );
    var merchTotalInclOrderDiscounts = order.getAdjustedMerchandizeTotalPrice(
        true
    );
    var orderDiscount = merchTotalExclOrderDiscounts.subtract(
        merchTotalInclOrderDiscounts
    );
    if (!empty(orderDiscount) && orderDiscount.value > 0.0) {
        xs.push({
            quantity: 1,
            unit_price: -orderDiscount.value
        });
    }

    return xs;
}

/**
 * Define parameters to request to Paidy API
 * @param {Object} customer - The SFCC customer object
 * @param {Object} order - The order object created from cart at the time of settlement
 * @returns {Object} Returns the Payment object necessary for Paidy Checkout request
 */
function paidyPay(customer, order) {
    var now = new Date();

    var buyer = null;
    try {
        buyer = {
            email: order.customerEmail || '',
            name1:
        order.billingAddress.lastName + ' ' + order.billingAddress.firstName ||
        '',
            phone: order.billingAddress.phone || ''
        };
        buyer.dob = null;
        if (!empty(customer.profile) && !empty(customer.profile.birthday)) {
            buyer.dob = utils.formatDate(customer.profile.birthday);
        }
    } catch (e) {
        log.error(
            'An error occurred at point # 1 on paidyPay.\nError message:' +
        e.toString() +
        '\norderNo:' +
        order.orderNo +
        '\ncustomerNo:' +
        order.customerNo
        );
    }

    var buyerData = null;
    try {
        buyerData = utils.getBuyerData(customer, now);
    } catch (e) {
        log.error(
            'An error occurred at point # 2 on paidyPay. Error message:' +
        e.toString() +
        '\ncustomerNo:' +
        order.customerNo +
        '\nnow:' +
        now
        );
    }
    var orderData = null;
    var nonPaidy = new Money(0, 'JPY');
    var tax = 0;
    if ((TaxMgr.getTaxationPolicy() === TaxMgr.TAX_POLICY_NET) && order.totalTax.available) {
        tax = order.totalTax.value;
    }

    try {
        orderData = {
            items: collectItems(order),
            order_ref: order.orderNo,
            shipping: order.adjustedShippingTotalPrice.available
                ? order.adjustedShippingTotalPrice.value
                : order.shippingTotalPrice.value,
            tax: tax,
            order_token: order.orderToken
        };

        // 他の支払い方法が混在している場合、その分の金額を「値引き」として item に追加
        var it = order.getPaymentInstruments().iterator();
        while (it.hasNext()) {
            var pi = it.next();
            if (
                pi.paymentMethod.toUpperCase().indexOf(Preferences.PaymentType.paidyStandard) !== 0 &&
           pi instanceof OrderPaymentInstrument) {
                nonPaidy = nonPaidy.add(pi.paymentTransaction.amount);
            }
        }
        if (nonPaidy.value > 0) {
            orderData.items.push({
                quantity: 1,
                unit_price: -nonPaidy.value
            });
        }
    } catch (e) {
        log.error(
            'An error occurred at point # 3 on paidyPay. Error message:' +
        e.toString() +
        '\ncustomerNo:' +
        order.customerNo +
        '\norder.orderNo:' +
        order.orderNo
        );
    }

    // ギフトによりshippingAddressを切り替える。
    // ギフト：請求先情報をセットする。
    // 非ギフト：配送先情報をセットする。
    var orderAddress = null;
    var shippingAddress = null;
    try {
        orderAddress = order.defaultShipment.gift
            ? order.billingAddress
            : order.defaultShipment.shippingAddress;
        shippingAddress = {
            line1: orderAddress.address2 || '',
            line2: orderAddress.address1 || '',
            city: orderAddress.city || '',
            state: orderAddress.stateCode || '',
            zip: orderAddress.postalCode || ''
        };
    } catch (e) {
        log.error(
            'An error occurred at point # 4 on paidyPay. Error message:' +
        e.toString() +
        '\ncustomerNo:' +
        order.customerNo +
        '\norder.orderNo:' +
        order.orderNo
        );
    }

    var o = {
        amount: utils.getGross(order).subtract(nonPaidy).value,
        // xFIXME: TAXが含まれていないきがする
        // API DOCより totalGrossPrice: The grand total price gross of tax for LineItemCtnr,
        // in purchase currency. Total prices represent the sum of product prices,
        // services prices and adjustments
        // 商品価格・サービス価格・値引きを含めた後の税込総額、だから含まれているはず
        currency: 'JPY',
        store_name:
      Site.getCurrent().getCustomPreferenceValue(
          'paidy_store_name'
      ) || '',
        buyer: buyer === null ? {} : buyer,
        buyer_data: buyerData === null ? {} : buyerData,
        order: orderData === null ? {} : orderData,
        shipping_address: shippingAddress === null ? {} : shippingAddress
    };
    o.test = true;

    return o;
}

/**
 * Create response JSON for request from the Paidy API
 * @param {string} payment - The selected payment method
 * @param {Object} currentCustomer - The SFCC customer object
 * @param {Object} order - The order object created from cart at the time of settlement
 * @returns {Object} Returns the execution result
 */
function getConfirmationPaidyJSON(payment, currentCustomer, order) {
    var responsejson = {};
    try {
        responsejson = {
            status: 200,
            config: getPaidyConfig(payment),
            paidyPay: paidyPay(currentCustomer, order)
        };
    } catch (e) {
        responsejson = {
            status: 500,
            error: e.toString()
        };
        log.error(
            'An error occurred in getConfirmationPaidyJSON. Error message:' +
        e.toString() +
        '\ncustomerId:' +
        order.customerNo +
        '\norderNo:' +
        order.orderNo
        );
    }
    return responsejson;
}

/**
 * Call the Paidy API
 * @param {Object} remote - The object returned from API. See Paidy reference API response for object format
 * @param {Object} local - The object passed to API. See Paidy reference request parameter for object format
 * @returns {?Object} Returns paidyPay execution result will be returned
 */
function fetchOrder(remote, local) {
    // check args exists
    if (empty(remote) || empty(local) || empty(local.order)) {
        return null;
    }
    var orderRef = local.order.order_ref;

    // check order number exists
    if (empty(orderRef)) {
        return null;
    }

    var Order = OrderMgr.getOrder(orderRef, local.order.order_token);
    var paidyId = remote.id;

    // execute Paidy Standard payment API
    var result = paidyPaymentAPI.paidyPay({ Order: Order }, paidyId);

    if (result.error) {
        return null;
    }

    return JSON.parse(result.details.ResultPaidy);
}

/**
 * Validation using argument values
 * @param {Object} remote - The comparison source object. See Paidy reference API response for object format
 * @param {Object} local - The object for comparison. See Paidy reference request parameter for object format
 * @returns {boolean} Returns true if the comparison result is true. Otherwise, returns false.
 */
function validate(remote, local) {
    if (empty(remote)) {
        return false;
    }
    var validateLocal = local;
    if (!validateLocal) {
        // orderTokenを保持していない場合の処理の為、getOrderはorderNoのみで取得
        // 不正取得の場合は後続の処理でfalseとなる
        var order = OrderMgr.getOrder(remote.order.oreder_ref);
        if (!order) return false;
        validateLocal = paidyPay(null, order);
    }

    var valid =
    remote.amount === validateLocal.amount &&
    remote.order.shipping === validateLocal.order.shipping &&
    remote.order.tax === validateLocal.order.tax &&
    remote.order.items.length === validateLocal.order.items.length;
    if (valid) {
        remote.order.items.forEach(function (a, index) {
            var b = validateLocal.order.items[index];
            if (a.id && b.id) {
                valid =
                valid &&
                a.id === b.id &&
                a.quantity === b.quantity &&
                a.unit_price === b.unit_price;
            }
        });
    }
    return valid;
}

/**
 * Validation,the time of  a standard payment confirmation
 * @param {string} payloadToPaidy - The comparison source string
 * @param {string} paidyResult - The string for comparison
 * @returns {boolean} Returns true if the validation result is true and there is no error or false if the validation result is false
 */
function validationPlaceOrder(payloadToPaidy, paidyResult) {
    try {
        var local = JSON.parse(payloadToPaidy);
        var remote = JSON.parse(paidyResult);
        remote = fetchOrder(remote, local);

        if (!validate(remote, local)) {
            log.error('Validation failed');
            return false;
        }

        return true;
    } catch (e) {
        log.error(
            'An error occurred at point # 2 on validationPlaceOrder. Error message:' +
        e.toString() +
        '\npayloadToPaidy:' +
        payloadToPaidy +
        '\npaidyResult:' +
        paidyResult
        );
        return false;
    }
}

module.exports = {
    getPaidyConfig: getPaidyConfig,
    paidyPay: paidyPay,
    getConfirmationPaidyJSON: getConfirmationPaidyJSON,
    validationPlaceOrder: validationPlaceOrder
};
