/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Check the current payment method', function () {
    var paidyHelpers = proxyquire('../../../../../cartridges/int_paidy_sfra/cartridge/scripts/paidy/paidyHelpers', {
        server: function () { return {}; },
        'dw/system/Transaction': function () { return {}; },
        'dw/order/PaymentInstrument': function () { return {}; },
        '*/cartridge/scripts/cart/cartHelpers': function () { return {}; },
        '*/cartridge/scripts/object/preferences': {
            PaymentType: {
                paydyNomal: 'PAIDY_NORMAL',
                paydyRegular: 'PAIDY_REGULAR'
            }
        }
    });

    // temporarily comment out these tests before merging these two PRs 
    // https://github.com/paidy/SalesforceCommerceCloud-AppExchange/pull/7
    // https://github.com/paidy/SalesforceCommerceCloud-AppExchange/pull/6

    // it('should return true if the payment method is PAIDY_NORMAL', function () {
    //     assert.equal(paidyHelpers.isPaidyNormal('PAIDY_NORMAL'), true);
    // });

    // it('should return false if the payment method is PAIDY_REGULAR', function () {
    //     assert.equal(paidyHelpers.isPaidyNormal('PAIDY_REGULAR'), false);
    // });

    // it('should return true if the payment method is PAIDY_REGULAR', function () {
    //     assert.equal(paidyHelpers.isPaidyRegular('PAIDY_REGULAR'), true);
    // });

    // it('should return false if the payment method is PAIDY_NORMAL', function () {
    //     assert.equal(paidyHelpers.isPaidyRegular('PAIDY_NORMAL'), false);
    // });

    // it('should return true if the payment method is PAIDY_NORMAL', function () {
    //     assert.equal(paidyHelpers.isPaidyPay('PAIDY_NORMAL'), true);
    // });

    // it('should return true if the payment method is PAIDY_REGULAR', function () {
    //     assert.equal(paidyHelpers.isPaidyPay('PAIDY_REGULAR'), true);
    // });
});
