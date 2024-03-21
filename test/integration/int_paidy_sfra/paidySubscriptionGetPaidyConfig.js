/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var sfccRequest = require('../../mocks/sfccRequest');

describe('SFRA: Get information about setting up PAIDY_SUBSCRIPTION', function () {
    this.timeout(25000);
    var cookieJar = request.jar();
    var cookieString;
    var myRequest = {
        url: '',
        method: 'POST',
        json: true,
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    myRequest.url = config.baseUrl + '/Cart-AddProduct';
    myRequest.form = {
        pid: 'P0138M',
        quantity: 1
    };


    before(function () {
        // adding product to Cart
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                cookieString = cookieJar.getCookieString(myRequest.url);
            })
            // csrf token generation
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                cookieJar.setCookie(request.cookie(cookieString), myRequest.url);
                return request(myRequest);
            })
            // login
            .then(function (csrfResponse) {
                var csrfJsonResponse = csrfResponse.body;
                myRequest.url = config.baseUrl + '/Account-Login?' +
                    csrfJsonResponse.csrf.tokenName + '=' +
                    csrfJsonResponse.csrf.token;
                myRequest.form = sfccRequest.loginAccount();
                return request(myRequest);
            })
            // response of submitshipping
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected CheckoutShippingServices-SubmitShipping statusCode to be 200.');
            })
            // csrf token generation
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                cookieJar.setCookie(request.cookie(cookieString), myRequest.url);
                return request(myRequest);
            })
            // set shipping address
            .then(function (csrfResponse) {
                var csrfJsonResponse = csrfResponse.body;
                myRequest.url = config.baseUrl + '/CheckoutShippingServices-SubmitShipping?' +
                    csrfJsonResponse.csrf.tokenName + '=' +
                    csrfJsonResponse.csrf.token;
                myRequest.form = sfccRequest.shippingAddress();
                return request(myRequest);
            })
            // response of submitshipping
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected CheckoutShippingServices-SubmitShipping statusCode to be 200.');
            })
            // csrf token generation
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                cookieJar.setCookie(request.cookie(cookieString), myRequest.url);
                return request(myRequest);
            })
            // setting billing address and payment method
            .then(function (csrfResponse) {
                var csrfJsonResponse = csrfResponse.body;
                myRequest.url = config.baseUrl + '/CheckoutServices-SubmitPayment?' +
                    csrfJsonResponse.csrf.tokenName + '=' +
                    csrfJsonResponse.csrf.token;
                myRequest.form = sfccRequest.billingAddress();
                myRequest.form.dwfrm_billing_paymentMethod = 'PAIDY_SUBSCRIPTION';
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected CheckoutServices-SubmitPayment statusCode to be 200.');
            });
    });

    it('should be able to get the setup value for PAIDY_SUBSCRIPTION', function () {
        myRequest.url = config.baseUrl + '/PaidySubscription-GetPaidyConfig';
        myRequest.method = 'GET';
        myRequest.form = {};

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200');
                assert.isTrue(response.body.success);
                assert.isNull(response.body.paidyConfig.paidyToken);
                assert.isString(response.body.paidyConfig.config.api_key);
                assert.isString(response.body.paidyConfig.config.logo_url);
                assert.isNull(response.body.paidyConfig.config.closed);
                assert.isString(response.body.paidyConfig.config.token.wallet_id);
                assert.isString(response.body.paidyConfig.config.token.type);
                assert.isNull(response.body.paidyConfig.config.token.description);
                assert.isString(response.body.paidyConfig.payload.store_name);
                assert.isString(response.body.paidyConfig.payload.buyer.name1);
                assert.isString(response.body.paidyConfig.payload.buyer.phone);
                assert.isString(response.body.paidyConfig.payload.buyer.dob);
            });
    });
});
