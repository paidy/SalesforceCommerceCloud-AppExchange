'use strict';

var server = require('server');

var Transaction = require('dw/system/Transaction');
var PaymentInstrument = require('dw/order/PaymentInstrument');

var cartHelpers = require('*/cartridge/scripts/cart/cartHelpers');
var Preferences = require('*/cartridge/scripts/object/preferences');

var PAIDY_NORMAL = Preferences.PaymentType.paydyNomal;
var PAIDY_REGULAR = Preferences.PaymentType.paydyRegular;

// static functions needed for paidy payment logic

/**
 * Check current payment method is Paidy payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy normal payment, false otherwise
 */
function isPaidyNormal(paymentMethod) {
    return paymentMethod === PAIDY_NORMAL;
}
/**
 * Check current payment method is Paidy regular payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy regular payment, false otherwise
 */
function isPaidyRegular(paymentMethod) {
    return paymentMethod === PAIDY_REGULAR;
}
/**
 * Check current payment method is Paidy payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy payment, false otherwise
 */
function isPaidyPay(paymentMethod) {
    return isPaidyNormal(paymentMethod) || isPaidyRegular(paymentMethod);
}

/**
 * Reset current basket payment instrument
 * @param {dw.order.Basket} currentBasket - the target Basket object
 */
function resetPaymentForms(currentBasket) {
    var paymentForm = server.forms.getForm('billing');
    var paymentMethodIdValue = paymentForm.paymentMethod.value;
    Transaction.wrap(function () {
        if (paymentMethodIdValue.equals(PaymentInstrument.METHOD_CREDIT_CARD)) {
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_NORMAL)
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_REGULAR)
            );
        } else if (paymentMethodIdValue.equals(PAIDY_NORMAL)) {
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(
                    PaymentInstrument.METHOD_CREDIT_CARD
                )
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_REGULAR)
            );
        } else if (paymentMethodIdValue.equals(PAIDY_REGULAR)) {
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(
                    PaymentInstrument.METHOD_CREDIT_CARD
                )
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_NORMAL)
            );
        }
    });
}

module.exports = {
    isPaidyNormal: isPaidyNormal,
    isPaidyRegular: isPaidyRegular,
    isPaidyPay: isPaidyPay,
    resetPaymentForms: resetPaymentForms
};
