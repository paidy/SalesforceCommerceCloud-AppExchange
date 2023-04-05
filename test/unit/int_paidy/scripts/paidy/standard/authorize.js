/* eslint-disable new-cap */
/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Authorize for PAIDY_STANDARD', function () {
    var Authorize = proxyquire('../../../../../../cartridges/int_paidy/cartridge/scripts/paidy/standard/authorize', {
        'dw/catalog/ProductMgr': function () { return {}; },
        'dw/order/OrderMgr': {
            getOrder: function () {
                return {};
            }
        },
        'dw/order/ProductLineItem': function () { return {}; },
        'dw/order/TaxMgr': {
            getTaxationPolicy: function () {
                return 1;
            },
            TAX_POLICY_NET: 1
        },
        'dw/order/OrderPaymentInstrument': function () { return {}; },
        'dw/system/Logger': {
            debug: function (text) {
                return text;
            },
            error: function (text) {
                return text;
            },
            getLogger: function () {
                return {
                    error: function () {
                        return '';
                    }
                };
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
        'dw/value/Money': function () { return {}; },
        'dw/web/Resource': {
            msg: function (key, bundleName, defaultMessage) {
                if (key === 'paidy.payment.error.timeout' && bundleName === 'checkout' && defaultMessage === null) {
                    return 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。';
                } else if (key === 'paidy.payment.error.authorize' && bundleName === 'checkout' && defaultMessage === null) {
                    return 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。';
                } else if (key === 'paidy.payment.error.rejected' && bundleName === 'checkout' && defaultMessage === null) {
                    return '今回の決済は承認されませんでした。申し訳ございませんが、オンラインショップが提供する他の支払方法をご利用ください。なお、審査結果の詳細につきましては開示できませんのであらかじめご了承ください。\nPaidyに関するお問い合わせ:0120-971-918';
                }
                return '';
            }
        },
        '*/cartridge/scripts/paidy/subscription/paidyPayment': {
            paidyPay: function () {
                return {
                    error: false,
                    details: {
                        ResultPaidy: '{"amount": 1903,"order": {"items": [{"id": "PDI001","quantity": 1,"title": "Paidyスニーカー","unit_price": 1230,"description": ""}],"shipping": 500,"tax": 173}}'
                    }
                };
            }
        },
        '*/cartridge/scripts/object/preferences': {
            PaymentType: {
                paidyStandard: 'PAIDY_STANDARD'
            }
        },
        '*/cartridge/scripts/paidy/paidyUtils': {
            getBuyerData: function (customer) {
                if (customer.anonymous) {
                    return {
                        age: 0,
                        order_count: 0,
                        ltv: 0,
                        last_order_amount: 0,
                        last_order_at: 0
                    };
                }

                return {
                    age: 10,
                    order_count: 0,
                    ltv: 0,
                    last_order_amount: 0,
                    last_order_at: 0
                };
            },
            getGross: function () {
                return {
                    subtract: function () {
                        return {
                            value: 1230
                        };
                    }
                };
            }
        }
    });

    // mock
    var order = require('../../../../../mocks/dw/order/Order');
    var customer = require('../../../../../mocks/dw/customer/Customer');

    // request definition
    global.request = {
        httpParameterMap: {
            processMultipart: function () {
                return null;
            }
        }
    };

    // empty definition
    global.empty = function (params) {
        if (params) {
            return false;
        }
        return true;
    };

    it('should return setup values where "payment_method" is "PAIDY_STANDARD"', function () {
        var expectedValue = {
            api_key: '',
            logo_url: '',
            metadata: {
                Platform: 'Salesforce Commerce Cloud'
            },
            closed: 'Replace this with a callback func. (callbackData) => {...}',
            payment_method: 'PAIDY_STANDARD',
            submit_button: '.submit-order button[type="submit"]',
            timeout: 300,
            messages: {
                errors: {
                    timeout: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                    authorize: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                    rejected_short: '今回の決済は承認されませんでした。申し訳ございませんが、オンラインショップが提供する他の支払方法をご利用ください。なお、審査結果の詳細につきましては開示できませんのであらかじめご了承ください。\nPaidyに関するお問い合わせ:0120-971-918'
                }
            }
        };

        assert.equal(JSON.stringify(Authorize.getPaidyConfig('PAIDY_STANDARD')), JSON.stringify(expectedValue));
    });

    it('should return the parameters containing registered customer information required by the Paidy API if the anonymous flag is false', function () {
        var expectedValue = {
            amount: 1230,
            currency: 'JPY',
            store_name: '',
            buyer: {
                email: 'successful.payment@paidy.com',
                name1: ' ',
                phone: '08000000001',
                dob: null
            },
            buyer_data: {
                age: 10,
                order_count: 0,
                ltv: 0,
                last_order_amount: 0,
                last_order_at: 0
            },
            order: {
                items: [],
                order_ref: '1000001',
                shipping: 1230,
                tax: 123,
                order_token: 'test-token'
            },
            shipping_address: { line1: '', line2: '', city: '', state: '', zip: '' },
            test: true
        };

        assert.equal(JSON.stringify(Authorize.paidyPay(
            customer.baseCustomerMock({
                anonymous: false
            }),
            order.baseOrderMock())), JSON.stringify(expectedValue));
    });


    // 引数のmock値を変更して再出力する用
    it('should return the parameters containing guest customer information required by the Paidy API if the anonymous flag is true', function () {
        var expectedValue = {
            amount: 1230,
            currency: 'JPY',
            store_name: '',
            buyer: {
                email: 'successful.payment@paidy.com',
                name1: ' ',
                phone: '08000000001',
                dob: null
            },
            buyer_data: {
                age: 0,
                order_count: 0,
                ltv: 0,
                last_order_amount: 0,
                last_order_at: 0
            },
            order: {
                items: [],
                order_ref: '1000001',
                shipping: 1230,
                tax: 123,
                order_token: 'test-token'
            },
            shipping_address: { line1: '', line2: '', city: '', state: '', zip: '' },
            test: true
        };

        assert.equal(JSON.stringify(Authorize.paidyPay(
            customer.baseCustomerMock({
                anonymous: true
            }),
            order.baseOrderMock())), JSON.stringify(expectedValue));
    });


    it('should return response JSON containing registered customer information from Paidy API if the anonymous flag is false', function () {
        var expectedValue = {
            status: 200,
            config: {
                api_key: '',
                logo_url: '',
                metadata: {
                    Platform: 'Salesforce Commerce Cloud'
                },
                closed: 'Replace this with a callback func. (callbackData) => {...}',
                payment_method: 'PAIDY_STANDARD',
                submit_button: '.submit-order button[type="submit"]',
                timeout: 300,
                messages: {
                    errors: {
                        timeout: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                        authorize: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                        rejected_short: '今回の決済は承認されませんでした。申し訳ございませんが、オンラインショップが提供する他の支払方法をご利用ください。なお、審査結果の詳細につきましては開示できませんのであらかじめご了承ください。\nPaidyに関するお問い合わせ:0120-971-918'
                    }
                }
            },
            paidyPay: {
                amount: 1230,
                currency: 'JPY',
                store_name: '',
                buyer: {
                    email: 'successful.payment@paidy.com',
                    name1: ' ',
                    phone: '08000000001',
                    dob: null
                },
                buyer_data:
                {
                    age: 10,
                    order_count: 0,
                    ltv: 0,
                    last_order_amount: 0,
                    last_order_at: 0
                },
                order: {
                    items: [],
                    order_ref: '1000001',
                    shipping: 1230,
                    tax: 123,
                    order_token: 'test-token'
                },
                shipping_address: {
                    line1: '', line2: '', city: '', state: '', zip: ''
                },
                test: true
            }
        };

        assert.equal(JSON.stringify(
            Authorize.getConfirmationPaidyJSON(
                'PAIDY_STANDARD',
                customer.baseCustomerMock({
                    anonymous: false
                }),
                order.baseOrderMock())), JSON.stringify(expectedValue));
    });

    // 引数のmock値を変更して再出力する用
    it('should return response JSON containing guest customer information from Paidy API if the anonymous flag is true', function () {
        var expectedValue = {
            status: 200,
            config: {
                api_key: '',
                logo_url: '',
                metadata: {
                    Platform: 'Salesforce Commerce Cloud'
                },
                closed: 'Replace this with a callback func. (callbackData) => {...}',
                payment_method: 'PAIDY_STANDARD',
                submit_button: '.submit-order button[type="submit"]',
                timeout: 300,
                messages: {
                    errors: {
                        timeout: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                        authorize: 'エラーが発生しました。時間をおいて再度お試しいただくようお願いいたします。',
                        rejected_short: '今回の決済は承認されませんでした。申し訳ございませんが、オンラインショップが提供する他の支払方法をご利用ください。なお、審査結果の詳細につきましては開示できませんのであらかじめご了承ください。\nPaidyに関するお問い合わせ:0120-971-918'
                    }
                }
            },
            paidyPay: {
                amount: 1230,
                currency: 'JPY',
                store_name: '',
                buyer: {
                    email: 'successful.payment@paidy.com',
                    name1: ' ',
                    phone: '08000000001',
                    dob: null
                },
                buyer_data:
                {
                    age: 0,
                    order_count: 0,
                    ltv: 0,
                    last_order_amount: 0,
                    last_order_at: 0
                },
                order: {
                    items: [],
                    order_ref: '1000001',
                    shipping: 1230,
                    tax: 123,
                    order_token: 'test-token'
                },
                shipping_address: {
                    line1: '', line2: '', city: '', state: '', zip: ''
                },
                test: true
            }
        };

        assert.equal(JSON.stringify(
            Authorize.getConfirmationPaidyJSON(
                'PAIDY_STANDARD',
                customer.baseCustomerMock({
                    anonymous: true
                }),
                order.baseOrderMock())), JSON.stringify(expectedValue));
    });

    it('should return true if pass order information validation', function () {
        var payloadToPaidy = '{"amount": 1903,"order": {"items": [{"id": "PDI001","quantity": 1,"title": "Paidyスニーカー","unit_price": 1230,"description": ""}],"order_ref": "1000001","shipping": 500,"tax": 173}}';
        var paidyResult = '{}';
        assert.equal(Authorize.validationPlaceOrder(payloadToPaidy, paidyResult), true);
    });

    // 引数のmock値を変更して再出力する用
    it('should return false if does not pass order information validation', function () {
        var payloadToPaidy = '{"amount": 10450,"order": {"items": [{"id": "PDI001","quantity": 1,"title": "Paidyスニーカー","unit_price": 9000,"description": ""}],"order_ref": "1000001","shipping": 500,"tax": 950}}';
        var paidyResult = '{}';
        assert.equal(Authorize.validationPlaceOrder(payloadToPaidy, paidyResult), false);
    });
});
