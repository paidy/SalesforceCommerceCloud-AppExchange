/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Authorize for PAIDY_REGULAR', function () {
    var Authorize = proxyquire('../../../../../../cartridges/int_paidy/cartridge/scripts/paidy/regular/authorize', {
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
        '*/cartridge/scripts/paidy/paidyUtils': {
            formatDate: function () {
                return '2020-01-14';
            }
        },
        '*/cartridge/scripts/paidy/regular/paidyPayment': {
            paidyPay: function (args) {
                if (args.error) {
                    return {
                        status: 1,
                        getDetail: function () {
                            return '';
                        }
                    };
                }

                return {
                    status: 0,
                    getDetail: function () {
                        return '';
                    }
                };
            }
        }
    });

    var order = require('../../../../../mocks/dw/order/Order');

    // empty definition
    global.empty = function (params) {
        if (params) {
            return false;
        }
        return true;
    };

    // session definition
    global.session = {
        forms: {
            billing: {
                billingAddress: {
                    addressFields: {
                        lastName: {
                            value: '山田'
                        },
                        firstName: {
                            value: '太郎'
                        },
                        phone: {
                            value: '08000000001'
                        }
                    },
                    email: {
                        emailAddress: {
                            value: 'successful.payment@paidy.com'
                        }
                    }
                }
            }
        },
        getCustomer: function () {
            return {
                profile: {
                    birthday: '',
                    custom: {
                        paidyToken: ''
                    }
                }
            };
        }
    };

    it('should return setup values', function () {
        var expectedValue = {
            success: true,
            paidyConfig: {
                paidyToken: '',
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
                        email: 'successful.payment@paidy.com',
                        name1: '山田 太郎',
                        phone: '08000000001',
                        dob: '2020-01-14'
                    }
                }
            }
        };

        assert.equal(JSON.stringify(Authorize.getPaidyConfig()), JSON.stringify(expectedValue));
    });

    it('should return object as "key: success, value: true" if the setting token is succeeded', function () {
        var tokenId = '';
        var expectedValue = {
            success: true
        };

        assert.equal(JSON.stringify(Authorize.setPaidyTokenToProfile(tokenId)), JSON.stringify(expectedValue));
    });

    it('should return object as "key: authorized, value: true" if the order is confirmed after payment', function () {
        var args = {
            Order: order.baseOrderMock(),
            error: false
        };

        var expectedValue = {
            authorized: true
        };

        assert.equal(JSON.stringify(Authorize.authorize(args)), JSON.stringify(expectedValue));
    });

    // mock値を変更して再出力する用
    it('should return object as "key: error, value: true" if the order is a failure after payment', function () {
        var args = {
            Order: order.baseOrderMock(),
            error: true
        };

        var expectedValue = {
            error: true,
            PlaceOrderError: {
                status: 1
            }
        };

        assert.equal(JSON.stringify(Authorize.authorize(args)), JSON.stringify(expectedValue));
    });
});
