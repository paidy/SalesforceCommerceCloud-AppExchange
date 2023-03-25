/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Redefining and updating settlement information in paidyRegular', function () {
    var PAIDY_REGULAR = proxyquire('../../../../../../cartridges/int_paidy_controllers/cartridge/scripts/payment/processor/paidyRegular', {
        'dw/order/PaymentMgr': {
            getPaymentMethod: function () {
                return {
                    getPaymentProcessor: function () {
                        return '';
                    }
                };
            }
        },
        'dw/system/Transaction': {
            wrap: function () {
                return;
            }
        },
        '*/package.json': {
            paidyCartridge: 'int_paidy',
            controllers: 'paidy_storefront_controllers'
        },
        // int_paidy_controllers 内に存在しないファイルは、キー値をべた書き
        'paidy_storefront_controllers/cartridge/scripts/models/CartModel': {
            get: function () {
                return;
            }
        },
        'int_paidy/cartridge/scripts/paidy/regular/authorize': {
            authorize: function () {
                return {
                    authorized: true
                };
            }
        },
        '*/cartridge/scripts/object/preferences': {
            PaymentType: {
                paydyRegular: 'PAIDY_REGULAR'
            }
        }
    });

    it('should return object as "key: success, value: true"', function () {
        var args = {};
        var expectedValue = {
            success: true
        };
        assert.equal(JSON.stringify(PAIDY_REGULAR.Handle(args)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: authorized, value: true"', function () {
        var args = {
            Order: {
                orderNo: ''
            },
            PaymentInstrument: {
                getPaymentMethod: function () {
                    return;
                },
                paymentTransaction: {
                    transactionID: '',
                    paymentProcessor: ''
                }
            }
        };

        var expectedValue = {
            authorized: true
        };

        assert.equal(JSON.stringify(PAIDY_REGULAR.Authorize(args)), JSON.stringify(expectedValue));
    });
});
