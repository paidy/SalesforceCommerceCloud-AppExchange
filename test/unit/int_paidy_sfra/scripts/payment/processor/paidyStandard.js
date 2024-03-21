/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Redefining and updating settlement information in paidyStandard', function () {
    var PAIDY_STANDARD = proxyquire('../../../../../../cartridges/int_paidy_sfra/cartridge/scripts/payment/processor/paidyStandard', {
        'dw/system/Transaction': {
            wrap: function () {
                return;
            }
        },
        'dw/system/Logger': {
            debug: function (text) {
                return text;
            },
            error: function (text) {
                return text;
            },
            getLogger: function (text) {
                return text;
            }
        },
        'dw/web/Resource': function () { return {}; },
        '*/cartridge/scripts/object/preferences': {
            PaymentType: {
                paidyStandard: 'PAIDY_STANDARD'
            }
        },
        '*/cartridge/scripts/util/collections': function () { return {}; }
    });

    it('should return object as "key: error, value: false"', function () {
        var basket = {};
        var paymentInformation = {};
        var expectedValue = {
            error: false
        };

        assert.equal(JSON.stringify(PAIDY_STANDARD.Handle(basket, paymentInformation)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: error, value: false"', function () {
        var orderNumber = '';
        var paymentInstrument = {};
        var paymentProcessor = '';

        var expectedValue = {
            fieldErrors: {},
            serverErrors: [],
            error: false
        };

        assert.equal(JSON.stringify(PAIDY_STANDARD.Authorize(orderNumber, paymentInstrument, paymentProcessor)), JSON.stringify(expectedValue));
    });
});
