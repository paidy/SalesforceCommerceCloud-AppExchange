'use strict';

var server = require('server');

var Transaction = require('dw/system/Transaction');
var PaymentInstrument = require('dw/order/PaymentInstrument');

var cartHelpers = require('*/cartridge/scripts/cart/cartHelpers');
var Preferences = require('*/cartridge/scripts/object/preferences');

var PAIDY_STANDARD = Preferences.PaymentType.paidyStandard;
var PAIDY_SUBSCRIPTION = Preferences.PaymentType.paidySubscription;

// static functions needed for paidy payment logic

/**
 * Check current payment method is Paidy payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy standard payment, false otherwise
 */
function isPaidyStandard(paymentMethod) {
    return paymentMethod === PAIDY_STANDARD;
}
/**
 * Check current payment method is Paidy subscription payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy subscription payment, false otherwise
 */
function isPaidySubscription(paymentMethod) {
    return paymentMethod === PAIDY_SUBSCRIPTION;
}
/**
 * Check current payment method is Paidy payment
 * @param {string} paymentMethod - current payment method
 * @returns {boolean} Returns true if the current payment method is Paidy payment, false otherwise
 */
function isPaidyPay(paymentMethod) {
    return isPaidyStandard(paymentMethod) || isPaidySubscription(paymentMethod);
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
                currentBasket.getPaymentInstruments(PAIDY_STANDARD)
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_SUBSCRIPTION)
            );
        } else if (paymentMethodIdValue.equals(PAIDY_STANDARD)) {
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(
                    PaymentInstrument.METHOD_CREDIT_CARD
                )
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_SUBSCRIPTION)
            );
        } else if (paymentMethodIdValue.equals(PAIDY_SUBSCRIPTION)) {
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(
                    PaymentInstrument.METHOD_CREDIT_CARD
                )
            );
            cartHelpers.removePaymentInstruments(
                currentBasket,
                currentBasket.getPaymentInstruments(PAIDY_STANDARD)
            );
        }
    });
}

module.exports = {
    isPaidyStandard: isPaidyStandard,
    isPaidySubscription: isPaidySubscription,
    isPaidyPay: isPaidyPay,
    resetPaymentForms: resetPaymentForms
};
