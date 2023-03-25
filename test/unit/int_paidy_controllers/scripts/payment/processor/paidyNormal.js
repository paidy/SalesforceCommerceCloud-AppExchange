/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Redefining and updating settlement information in paidyNormal', function () {
    var PAIDY_NORMAL = proxyquire('../../../../../../cartridges/int_paidy_controllers/cartridge/scripts/payment/processor/paidyNormal', {
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
        '*/cartridge/scripts/object/preferences': {
            PaymentType: {
                paydyNomal: 'PAIDY_NORMAL'
            }
        }
    });

    it('should return object as "key: success, value: true"', function () {
        var args = {};
        var expectedValue = {
            success: true
        };
        assert.equal(JSON.stringify(PAIDY_NORMAL.Handle(args)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: authorized, value: true"', function () {
        var args = {
            OrderNo: '',
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
        assert.equal(JSON.stringify(PAIDY_NORMAL.Authorize(args)), JSON.stringify(expectedValue));
    });
});
