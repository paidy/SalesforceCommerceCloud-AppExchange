/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('SFRA: Get information about setting up PAIDY_STANDARD', function () {
    this.timeout(25000);
    var cookieJar = request.jar();
    var myGetRequest = {
        url: '',
        method: 'GET',
        json: true,
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should be able to get the setup value for PAIDY_STANDARD', function () {
        myGetRequest.url = config.baseUrl + '/PaidyStandard-GetPaidyConfig';

        return request(myGetRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200');
                assert.isString(response.body.api_key);
                assert.isString(response.body.logo_url);
                assert.deepEqual(response.body.metadata, { Platform: 'Salesforce Commerce Cloud' });
                assert.isString(response.body.closed);
                assert.equal(response.body.payment_method, 'PAIDY_STANDARD');
                assert.isString(response.body.submit_button);
                assert.isNumber(response.body.timeout);
                assert.isString(response.body.messages.errors.timeout);
                assert.isString(response.body.messages.errors.authorize);
                assert.isString(response.body.messages.errors.rejected_short);
            });
    });
});
