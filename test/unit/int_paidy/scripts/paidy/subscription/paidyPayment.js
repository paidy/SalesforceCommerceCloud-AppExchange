/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Confirm payment for PAIDY_SUBSCRIPTION', function () {
    var PaidyPayment = proxyquire('../../../../../../cartridges/int_paidy/cartridge/scripts/paidy/subscription/paidyPayment', {
        'dw/catalog/ProductMgr': function () { return {}; },
        'dw/order/TaxMgr': {
            getTaxationPolicy: function () {
                return 1;
            },
            TAX_POLICY_NET: 1
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
        'dw/system/Status': function () {
            return {
                code: 'OK',
                details: {
                    PaymentId: 'pay_0001',
                    ResultPaidy: {
                        id: 'pay_0001',
                        created_at: '2020-01-24T00:00:00.000Z',
                        expires_at: '2020-03-01T06:00:00.000Z',
                        amount: 13750,
                        currency: 'JPY',
                        description: null,
                        store_name: '',
                        test: true,
                        status: 'authorized',
                        tier: 'classic',
                        buyer: {
                            name1: '山田 太郎',
                            name2: 'ヤマダ タロウ',
                            email: 'successful.payment@paidy.com',
                            phone: '818000000001'
                        },
                        order: {
                            tax: 1250,
                            shipping: 500,
                            order_ref: '1000001',
                            items: [
                                {
                                    id: 'PDI001',
                                    title: 'Paidyスニーカー',
                                    description: 'Paidyスニーカー Cloud ストアの新作ジュエリーを加えると、華やかな存在感を演出できます。 ',
                                    unit_price: 12000,
                                    quantity: 1
                                }
                            ],
                            updated_at: null
                        },
                        shipping_address: {
                            line1: 'AXISビル 10F',
                            line2: '六本木4-22-1',
                            city: '港区',
                            state: '東京都',
                            zip: '106-2004'
                        },
                        captures: [],
                        refunds: [],
                        metadata: {
                            Platform: 'Salesforce Commerce Cloud'
                        }
                    }
                },
                error: false,
                addDetail: function () {
                    return {};
                }
            };
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
        'dw/value/Money': function () { return {}; },
        '*/cartridge/scripts/paidy/paidyUtils': {
            getBuyerData: function () {
                return '';
            }
        },
        '*/cartridge/scripts/paidy/subscription/callService': {
            ServiceType: {
                get: 'GET',
                post: 'POST'
            },
            callService: function () {
                return {
                    status: 'authorized',
                    id: 'test_id'
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

    it('should return the successful result of the Paidy API', function () {
        var pdict = {
            Order: order.baseOrderMock()
        };

        var paidyToken = '';
        var expectedValue = {
            code: 'OK',
            details: {
                PaymentId: 'pay_0001',
                ResultPaidy: {
                    id: 'pay_0001',
                    created_at: '2020-01-24T00:00:00.000Z',
                    expires_at: '2020-03-01T06:00:00.000Z',
                    amount: 13750,
                    currency: 'JPY',
                    description: null,
                    store_name: '',
                    test: true,
                    status: 'authorized',
                    tier: 'classic',
                    buyer: {
                        name1: '山田 太郎',
                        name2: 'ヤマダ タロウ',
                        email: 'successful.payment@paidy.com',
                        phone: '818000000001'
                    },
                    order: {
                        tax: 1250,
                        shipping: 500,
                        order_ref: '1000001',
                        items: [
                            {
                                id: 'PDI001',
                                title: 'Paidyスニーカー',
                                description: 'Paidyスニーカー Cloud ストアの新作ジュエリーを加えると、華やかな存在感を演出できます。 ',
                                unit_price: 12000,
                                quantity: 1
                            }
                        ],
                        updated_at: null
                    },
                    shipping_address: {
                        line1: 'AXISビル 10F',
                        line2: '六本木4-22-1',
                        city: '港区',
                        state: '東京都',
                        zip: '106-2004'
                    },
                    captures: [],
                    refunds: [],
                    metadata: {
                        Platform: 'Salesforce Commerce Cloud'
                    }
                }
            },
            error: false
        };

        assert.equal(JSON.stringify(PaidyPayment.paidyPay(pdict, paidyToken)), JSON.stringify(expectedValue));
    });
});
