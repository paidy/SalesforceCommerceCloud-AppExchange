/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Paidy payment utilities', function () {
    var PaidyUtils = proxyquire('../../../../../cartridges/int_paidy/cartridge/scripts/paidy/paidyUtils', {
        'dw/util/StringUtils': {
            formatCalendar: function () {
                return '2020-01-14';
            }
        },
        'dw/order/Order': function () { return {}; },
        'dw/order/OrderMgr': {
            searchOrders: function () {
                return {
                    hasNext: function () {
                        return;
                    }
                };
            }
        },
        'dw/order/OrderPaymentInstrument': function () { return {}; },
        'dw/util/Calendar': function () { return {}; },
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
        '*/cartridge/scripts/object/preferences': {
            PaymentType: function () {
                return {
                    paydyNomal: 'PAIDY_NORMAL',
                    paydyRegular: 'PAIDY_REGULAR'
                };
            }
        }
    });

    var order = require('../../../../mocks/dw/order/Order');
    var customer = require('../../../../mocks/dw/customer/Customer');

    // empty definition
    global.empty = function (params) {
        if (params) {
            return false;
        }
        return true;
    };

    it('should be converted to a string in yyyy-MM-dd format', function () {
        var date = new Date('January 14, 2020 09:00:00');
        assert.equal(PaidyUtils.formatDate(date), '2020-01-14');
    });

    it('should be an empty string if the date is null', function () {
        assert.equal(PaidyUtils.formatDate(null), '');
    });

    it('should return the gross price in the order information if the available flag of the gross price is true', function () {
        assert.equal(PaidyUtils.getGross(order.baseOrderMock(
            {
                totalGrossPrice: {
                    value: 333,
                    available: true
                }
            }
            )).value, 333);
    });

    it('should return the adjustment price in the order information if the available flag of the gross price is false', function () {
        assert.equal(PaidyUtils.getGross(order.baseOrderMock(
            {
                totalGrossPrice: {
                    available: false
                },
                getAdjustedMerchandizeTotalPrice: function () {
                    return {
                        add: function () {
                            return 500;
                        }
                    };
                }
            }
        )), 500);
    });

    it('should get buyer data for registered customer', function () {
        var mockCurrentDate = {
            getTime: function () {
                return 1579791600000; // '2020-01-24 00:00:000'のタイムスタンプ
            }
        };

        var expectedValue = {
            age: 4,
            order_count: 0,
            ltv: 0,
            last_order_amount: 0,
            last_order_at: 0
        };

        assert.equal(JSON.stringify(PaidyUtils.getBuyerData(customer.baseCustomerMock(
            {
                anonymous: false,
                profile: {
                    creationDate: {
                        getTime: function () {
                            return 1579446000000; // '2020-01-20 00:00:000'のタイムスタンプ
                        }
                    }
                }
            }
        ), mockCurrentDate)), JSON.stringify(expectedValue));
    });

    it('should get buyer data as 0 for guest customer', function () {
        var expectedValue = {
            age: 0,
            order_count: 0,
            ltv: 0,
            last_order_amount: 0,
            last_order_at: 0
        };

        assert.equal(JSON.stringify(PaidyUtils.getBuyerData(customer.baseCustomerMock(
            {
                anonymous: true
            }
        ), new Date())), JSON.stringify(expectedValue));
    });
});
