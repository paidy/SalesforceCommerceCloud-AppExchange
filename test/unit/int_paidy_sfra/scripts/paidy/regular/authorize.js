/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Authorize for PAIDY_REGULAR', function () {
    var Authorize = proxyquire('../../../../../../cartridges/int_paidy_sfra/cartridge/scripts/paidy/regular/authorize', {
        server: {
            forms: {
                getForm: function () {
                    return {
                        addressFields: {
                            lastName: {
                                htmlValue: '山田'
                            },
                            firstName: {
                                htmlValue: '太郎'
                            }
                        },
                        contactInfoFields: {
                            email: {
                                value: 'successful.payment@paidy.com'
                            },
                            phone: {
                                value: '08000000001'
                            }
                        }
                    };
                }
            }
        },
        'dw/order/BasketMgr': {
            getCurrentBasket: function () {
                return {};
            }
        },
        'dw/customer/CustomerMgr': {
            getCustomerByCustomerNumber: function (customerNo) {
                return customerNo;
            }
        },
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function () {
                        return '';
                    }
                };
            }
        },
        'dw/system/Status': {
            OK: 0
        },
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
        '*/cartridge/scripts/paidy/paidyUtils': {
            formatDate: function () {
                return '2020-01-14';
            }
        },
        '*/cartridge/scripts/paidy/regular/paidyPayment': {
            paidyPay: function (order, paidyToken) {
                if (paidyToken === 'token_error') {
                    return {
                        getDetail: function () {
                            return '';
                        },
                        status: 1
                    };
                }

                return {
                    getDetail: function () {
                        return '';
                    },
                    status: 0
                };
            }
        }
    });

    var order = require('../../../../../mocks/dw/order/Order');
    var customer = require('../../../../../mocks/dw/customer/Customer');

    // empty definition
    global.empty = function (params) {
        if (params) {
            return false;
        }
        return true;
    };

    it('should return setup values', function () {
        var req = {
            currentCustomer: customer.baseCustomerMock()
        };

        var expectedValue = {
            success: true,
            paidyConfig: {
                paidyToken: null,
                paidy_time_out_second: '',
                config: {
                    api_key: '',
                    logo_url: '',
                    closed: null,
                    token: {
                        wallet_id: 'default',
                        type: 'recurring',
                        description: ''
                    }
                },
                payload: {
                    store_name: '',
                    buyer: {
                        name1: '山田 太郎',
                        phone: '08000000001',
                        dob: '2020-01-14'
                    }
                }
            }
        };

        assert.equal(JSON.stringify(Authorize.getPaidyConfig(req)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: success, value: true" if the setting token is succeeded', function () {
        var tokenId = '';
        var req = {
            currentCustomer: customer.baseCustomerMock()
        };

        var expectedValue = {
            success: true
        };

        assert.equal(JSON.stringify(Authorize.setPaidyTokenToProfile(tokenId, req)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: authorized, value: true" if the order is confirmed after payment', function () {
        var paidyToken = '';

        var expectedValue = {
            authorized: true
        };

        assert.equal(JSON.stringify(Authorize.Authorize(order.baseOrderMock(), paidyToken)), JSON.stringify(expectedValue));
    });

    // mock値を変更して再出力する用
    it('should return object as "key: error, value: true" if the order is a failure after payment', function () {
        var paidyToken = 'token_error';

        var expectedValue = {
            error: true,
            PlaceOrderError: {
                status: 1
            }
        };

        assert.equal(JSON.stringify(Authorize.Authorize(order.baseOrderMock(), paidyToken)), JSON.stringify(expectedValue));
    });
});
