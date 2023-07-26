/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Create payment information for paidySubscription', function () {
    var PAIDY_SUBSCRIPTION_FORM_PROCESSOR = proxyquire('../../../../../../cartridges/int_paidy_sfra/cartridge/scripts/payment/processor/paidySubscriptionFormProcessor', {
    });

    it('should return object values with payment method added to customer information', function () {
        var req = {
            form: {
                storedPaymentUUID: ''
            }
        };
        var paymentForm = {
            paymentMethod: {
                value: 'PAIDY_SUBSCRIPTION'
            }
        };
        var viewFormData = {
            address: {
                firstName: {
                    value: '名'
                },
                lastName: {
                    value: '姓'
                },
                address1: {
                    value: '住所1'
                },
                address2: {
                    value: null
                },
                city: {
                    value: '市区町村'
                },
                postalCode: {
                    value: '123-1234'
                },
                countryCode: {
                    value: 'JP'
                },
                stateCode: {
                    value: '都道府県'
                }
            },
            email: {
                value: 'successful.payment@paidy.com'
            },
            phone: {
                value: '08000000001'
            },
            paymentInformation: ''
        };

        var expectedValue = {
            error: false,
            viewData: {
                address: {
                    firstName: {
                        value: '名'
                    },
                    lastName: {
                        value: '姓'
                    },
                    address1: {
                        value: '住所1'
                    },
                    address2: {
                        value: null
                    },
                    city: {
                        value: '市区町村'
                    },
                    postalCode: {
                        value: '123-1234'
                    },
                    countryCode: {
                        value: 'JP'
                    },
                    stateCode: {
                        value: '都道府県'
                    }
                },
                email: {
                    value: 'successful.payment@paidy.com'
                },
                phone: {
                    value: '08000000001'
                },
                paymentInformation: {},
                paymentMethod: {
                    value: 'PAIDY_SUBSCRIPTION',
                    htmlName: 'PAIDY_SUBSCRIPTION'
                }
            }
        };

        assert.equal(JSON.stringify(PAIDY_SUBSCRIPTION_FORM_PROCESSOR.processForm(req, paymentForm, viewFormData)), JSON.stringify(expectedValue));
    });
});
