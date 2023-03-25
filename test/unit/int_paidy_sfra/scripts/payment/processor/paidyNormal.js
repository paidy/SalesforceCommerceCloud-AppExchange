/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Redefining and updating settlement information in paidyNormal', function () {
    var PAIDY_NORMAL = proxyquire('../../../../../../cartridges/int_paidy_sfra/cartridge/scripts/payment/processor/paidyNormal', {
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
                paydyNomal: 'PAIDY_NORMAL'
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

        assert.equal(JSON.stringify(PAIDY_NORMAL.Handle(basket, paymentInformation)), JSON.stringify(expectedValue));
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

        assert.equal(JSON.stringify(PAIDY_NORMAL.Authorize(orderNumber, paymentInstrument, paymentProcessor)), JSON.stringify(expectedValue));
    });
});
