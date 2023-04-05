/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
'use strict';

var server = require('server');

// API Modules
var BasketMgr = require('dw/order/BasketMgr');
var CustomerMgr = require('dw/customer/CustomerMgr');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var utils = require('*/cartridge/scripts/paidy/paidyUtils');
var paidyPaymentAPI = require('*/cartridge/scripts/paidy/subscription/paidyPayment');

var log = Logger.getLogger('Paidy', 'PAIDY');

/**
 * Get the Paidy payment settings
 * @param {Object} req - The request data of server
 * @returns {Object} Returns paidy config data paidy config data
 */
function getPaidyConfig(req) {
    var responseJson = {};
    responseJson.success = false;
    responseJson.paidyConfig = {};

    try {
        var currentBasket = BasketMgr.getCurrentBasket();
        var paymentForm = server.forms.getForm('billing');
        var customer = req.currentCustomer;
        // get data of customer (email, name, phone) from billing session form
        var lastName =
      paymentForm.addressFields.lastName.htmlValue ||
      currentBasket.billingAddress.lastName;
        var firstName =
      paymentForm.addressFields.firstName.htmlValue ||
      currentBasket.billingAddress.firstName;
        var name = lastName + ' ' + firstName;
        var email = currentBasket.customerEmail;
        var phone =
      paymentForm.contactInfoFields.phone.value ||
      currentBasket.billingAddress.phone;
        var dob = null;
        var paidyToken = null;
        var currentSite = Site.getCurrent();
        var paidyApiKey = currentSite.getCustomPreferenceValue('paidy_api_key');
        var paidyLogoUrl = currentSite.getCustomPreferenceValue('paidy_logo_url');
        var paidyStoreName =
      currentSite.getCustomPreferenceValue('paidy_store_name') || '';
        var paidyTimeOutSecond = currentSite.getCustomPreferenceValue(
            'paidy_time_out_second'
        );
        var paidyTokenDescription = currentSite.getCustomPreferenceValue(
            'paidy_token_description'
        );

        if (!empty(customer)) {
            var profile = customer.profile;
            dob = utils.formatDate(profile.birthday);
        }

        responseJson.paidyConfig = {
            paidyToken: paidyToken,
            paidy_time_out_second: paidyTimeOutSecond,
            config: {
                api_key: paidyApiKey,
                logo_url: paidyLogoUrl,
                closed: null, // jsでセット
                token: {
                    wallet_id: 'default',
                    type: 'recurring',
                    description: paidyTokenDescription
                }
            },
            payload: {
                store_name: paidyStoreName,
                buyer: {
                    email: email,
                    name1: name,
                    phone: phone,
                    dob: dob
                }
            }
        };

        responseJson.success = true;
    } catch (e) {
        responseJson.success = false;
        log.error(
            'An error occurred in getPaidyConfig. Error message:' + e.toString()
        );
    }

    return responseJson;
}

/**
 * Set Token in customer information
 * @param {string} tokenId - The tokenId issued by Paidy
 * @param {Object} req - The request data of server
 * @returns {Object} Returns object with processing result
 */
function setPaidyToken(tokenId, req) {
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var responseJson = {};
    responseJson = {};
    responseJson.success = false;

    try {
        Transaction.wrap(function () {
            customer.profile.custom.paidyToken = tokenId;
        });
    } catch (e) {
        log.error(
            'An error occurred in setPaidyToken. Error message:' +
        e.toString() +
        '\ncustomerNo:' +
        req.currentCustomer.profile.customerNo
        );
    }
    responseJson.success = true;

    return responseJson;
}

/**
 * Register a Paidy Token after the payment is processed
 * @param {Object} order - The The order object created by COHelpers.createOrder (currentBasket) in controllers/CheckoutService
 * @param {string} paidyToken - The tokenId issued by Paidy
 * @returns {Object} Returns object with processing result
 */
function authorize(order, paidyToken) {
    // Call Paidy payment API
    var result = paidyPaymentAPI.paidyPay(order, paidyToken);

    if (result.status !== Status.OK) {
        return {
            error: true,
            PlaceOrderError: result
        };
    }

    var paymentId = result.getDetail('PaymentId');
    Transaction.wrap(function () {
        order.custom.paidyToken = paidyToken;
        order.custom.paidyPaymentId = paymentId;
    });

    return {
        authorized: true
    };
}

module.exports = {
    getPaidyConfig: getPaidyConfig,
    setPaidyTokenToProfile: setPaidyToken,
    Authorize: authorize
};
