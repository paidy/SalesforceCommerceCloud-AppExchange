/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var sfccRequest = require('../../mocks/sfccRequest');

describe('SFRA: Set a token for customer information', function () {
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
                myRequest.form.dwfrm_billing_paymentMethod = 'PAIDY_STANDARD';
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected CheckoutServices-SubmitPayment statusCode to be 200.');
            });
    });

    it('should set token successfully', function () {
        var tokenId = 'tok_test';
        myRequest.url = config.baseUrl + '/PaidySubscription-SetPaidyToken?&tokenid=' + tokenId;
        myRequest.method = 'GET';
        myRequest.form = {};

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200');
                assert.isTrue(response.body.success);
            });
    });
});
