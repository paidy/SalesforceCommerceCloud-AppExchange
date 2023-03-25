'use strict';

/* API includes */
var Cart = require(require('*/package.json').controllers +
  '/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

var Preferences = require('*/cartridge/scripts/object/preferences');

/**
 * Redefine payment method for the Paidy (normal) payment
 * @param {Object} args - The object containing Basket
 * @returns {Object} Returns success object
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);
    var PaymentType = Preferences.PaymentType.paydyNomal;

    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments(PaymentType);
        cart.createPaymentInstrument(
            PaymentType,
            cart.getNonGiftCertificateAmount()
        );
    });

    return { success: true };
}

/**
 * Paidy(normal)payment, process transaction settings
 * @param {Object} args - The object containing OrderNo,PaymentInstrument
 * @returns {Object} Returns error or authorized
 */
function Authorize(args) {
    var orderNo = args.OrderNo;
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(
        paymentInstrument.getPaymentMethod()
    ).getPaymentProcessor();

    Transaction.wrap(function () {
        paymentInstrument.paymentTransaction.transactionID = orderNo;
        paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
    });

    return { authorized: true };
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
