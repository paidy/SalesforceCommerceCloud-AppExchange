/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../itSG.config');

describe('SiteGenesis: Get information about setting up PAIDY_STANDARD', function () {
    this.timeout(25000);
    var cookieJar = request.jar();
    var myRequest = {
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

    myRequest.url = config.baseUrl + '/PaidyStandard-GetPaidyConfig';
    myRequest.form = {};

    // CSRFtokenが生成できない為、ResponseのstatusCodeのみを確認している
    it('should be able to get the setup value for PAIDY_STANDARD', function () {
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                assert.isString(response.body.api_key);
                assert.isString(response.body.logo_url);
                assert.deepEqual(response.body.metadata, undefined);
                assert.isString(response.body.closed);
                // session.formsに値セットすることが出来ないため、「payment_method」がstring型であればOKとする
                assert.isString(response.body.payment_method);
                assert.isString(response.body.submit_button);
                assert.isNumber(response.body.timeout);
                assert.isString(response.body.messages.errors.timeout);
                assert.isString(response.body.messages.errors.authorize);
                assert.isString(response.body.messages.errors.rejected_short);
            });
    });
});
