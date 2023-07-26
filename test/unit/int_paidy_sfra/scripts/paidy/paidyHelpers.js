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
                paidyStandard: 'PAIDY_STANDARD',
                paidySubscription: 'PAIDY_SUBSCRIPTION'
            }
        }
    });

    it('should return true if the payment method is PAIDY_STANDARD', function () {
        assert.equal(paidyHelpers.isPaidyStandard('PAIDY_STANDARD'), true);
    });

    it('should return false if the payment method is PAIDY_SUBSCRIPTION', function () {
        assert.equal(paidyHelpers.isPaidyStandard('PAIDY_SUBSCRIPTION'), false);
    });

    it('should return true if the payment method is PAIDY_SUBSCRIPTION', function () {
        assert.equal(paidyHelpers.isPaidySubscription('PAIDY_SUBSCRIPTION'), true);
    });

    it('should return false if the payment method is PAIDY_STANDARD', function () {
        assert.equal(paidyHelpers.isPaidySubscription('PAIDY_STANDARD'), false);
    });

    it('should return true if the payment method is PAIDY_STANDARD', function () {
        assert.equal(paidyHelpers.isPaidyPay('PAIDY_STANDARD'), true);
    });

    it('should return true if the payment method is PAIDY_SUBSCRIPTION', function () {
        assert.equal(paidyHelpers.isPaidyPay('PAIDY_SUBSCRIPTION'), true);
    });
});
