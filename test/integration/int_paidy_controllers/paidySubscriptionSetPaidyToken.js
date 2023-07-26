/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../itSG.config');

describe('SiteGenesis: Set a token for customer information', function () {
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

    myRequest.url = config.baseUrl + '/PaidySubscription-SetPaidyToken';
    myRequest.form = {};

    it('should communicate successfully with SFCC server', function () {
        return request(myRequest)
            .then(function (response) {
                // sessionに値セットすることが出来ないため、response.statusCodeのみ比較
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200');
            });
    });
});
