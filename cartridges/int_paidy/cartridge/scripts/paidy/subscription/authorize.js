/* eslint-disable no-undef */
'use strict';

// API Modules
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var utils = require('*/cartridge/scripts/paidy/paidyUtils');

var log = Logger.getLogger('Paidy', 'PAIDY');

var paidyPaymentAPI = require('*/cartridge/scripts/paidy/subscription/paidyPayment');

/**
 * Get the Paidy payment settings
 * @returns {Object} Returns paidy config data paidy config data
 */
function getPaidyConfig() {
    var responseJson = {};
    responseJson.success = false;
    responseJson.paidyConfig = {};

    try {
        var currentForms = session.forms;
        var customer = session.getCustomer();
        // get data of customer (email, name, phone) from billing session form
        var email = currentForms.billing.billingAddress.email.emailAddress.value;
        var name =
      currentForms.billing.billingAddress.addressFields.lastName.value +
      ' ' +
      currentForms.billing.billingAddress.addressFields.firstName.value;
        var phone = currentForms.billing.billingAddress.addressFields.phone.value;
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
            paidyToken = profile.custom.paidyToken;
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
 * @returns {Object} Returns object with processing result
 */
function setPaidyToken(tokenId) {
    var customer = session.getCustomer();

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
        customer.profile.customerNo
        );
    }
    responseJson.success = true;

    return responseJson;
}

/**
 * Register a Paidy Token after the payment is processed
 * @param {Object} args - The object containing order information
 * @returns {Object} Returns object with processing result
 */
function authorize(args) {
    var order = args.Order;
    var customer = order.getCustomer();

    // Call Paidy payment API
    var result = paidyPaymentAPI.paidyPay(args);

    if (result.status !== Status.OK) {
        return {
            error: true,
            PlaceOrderError: result
        };
    }

    var paymentId = result.getDetail('PaymentId');
    Transaction.wrap(function () {
        order.custom.paidyToken = customer.profile.custom.paidyToken;
        order.custom.paidyPaymentId = paymentId;
    });

    return {
        authorized: true
    };
}

module.exports = {
    getPaidyConfig: getPaidyConfig,
    setPaidyTokenToProfile: setPaidyToken,
    authorize: authorize
};
