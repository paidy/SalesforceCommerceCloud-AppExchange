/* eslint-disable no-unused-vars */
'use strict';

/* API includes */
var collections = require('*/cartridge/scripts/util/collections');

var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');

var Preferences = require('*/cartridge/scripts/object/preferences');

var Logger = require('dw/system/Logger');
var log = Logger.getLogger('Paidy', 'PAIDY');

/**
 * A paidy(standard) payment instrument is created.
 * @param {Object} basket - The basket object
 * @param {*} paymentInformation - "paymentInformation" is undefined, but may be used by other than "int_paidy_sfra", so keep it.
 * @returns {Object} Returns that it is not an error
 */
function Handle(basket, paymentInformation) {
    var currentBasket = basket;
    var PaymentType = Preferences.PaymentType.paidyStandard;

    Transaction.wrap(function () {
        var paymentInstruments = currentBasket.getPaymentInstruments(PaymentType);

        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        currentBasket.createPaymentInstrument(
            PaymentType,
            currentBasket.totalGrossPrice
        );
    });

    return { error: false };
}

/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @returns {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    try {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(
                paymentProcessor
            );
        });
    } catch (e) {
        log.error(
            'An error occurred in Authorize. Error message:' +
        e.toString() +
        '\norderNo:' +
        orderNumber
        );
        error = true;
        serverErrors.push(Resource.msg('error.technical', 'checkout', null));
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
