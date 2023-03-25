'use strict';

/* API Includes */
var Cart = require(require('*/package.json').controllers +
  '/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

var Preferences = require('*/cartridge/scripts/object/preferences');

// 関数内に定義するとテストコードでモック設定が別途必要になるためグローバル変数で定義する
var regularAuthorize = require(require('*/package.json').paidyCartridge +
  '/cartridge/scripts/paidy/regular/authorize');

/**
 * Redefine payment method for the Paidy (subscription) payment
 * @param {Object} args - The object containing Basket information
 * @returns {Object} Returns success object
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);
    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments(Preferences.PaymentType.paydyRegular);
        cart.createPaymentInstrument(
            Preferences.PaymentType.paydyRegular,
            cart.getNonGiftCertificateAmount()
        );
    });

    return { success: true };
}

/**
 * Paidy(subscription) payment, process transaction settings
 * @param {Object} args - The object containing Order,PaymentInstrument
 * @returns {Object} Returns /cartridge/scripts/paidy/regular/Authorize-authorize object
 */
function Authorize(args) {
    var order = args.Order;

    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(
        paymentInstrument.getPaymentMethod()
    ).getPaymentProcessor();

    Transaction.wrap(function () {
        paymentInstrument.paymentTransaction.transactionID = order.orderNo;
        paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
    });

    return regularAuthorize.authorize(args);
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
