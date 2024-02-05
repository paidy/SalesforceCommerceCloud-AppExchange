/* eslint-disable require-jsdoc */
'use strict';

var Customer = require('../../../mocks/dw/customer/Customer');

function baseOrderMock(obj) {
    var params = {
        ORDER_STATUS_NEW: 1,
        ORDER_STATUS_CREATED: 2,
        ORDER_STATUS_OPEN: 3,
        adjustedShippingTotalPrice: {
            available: true,
            value: 1230
        },
        allProductLineItems: {
            empty: true,
            toArray: function () {
                return [];
            }
        },
        currencyCode: 'GBP',
        orderNumber: '1000001',
        orderNo: '1000001',
        customerEmail: 'successful.payment@paidy.com',
        shippingTotalPrice: {
            subtract: function () { return {}; },
            value: 1230
        },
        defaultShipment: {
            shippingAddress: {
                countryCode: {
                    value: 'ja_jp'
                }
            },
            gift: false
        },
        billingAddress: {
            lastName: '',
            firstName: '',
            phone: '08000000001'
        },
        status: {
            value: 1,
            displayValue: 'New'
        },
        allLineItems: {
            iterator: function () {
                return {
                    hasNext: function () { return; } };
            }
        },
        orderToken: 'test-token',
        totalTax: {
            available: true,
            value: 123
        },
        custom: {
            paidyToken: '',
            paidyPaymentId: ''
        },
        totalGrossPrice: {
            available: true,
            value: 1353
        },
        giftCertificateTotalPrice: 0,
        getOrderNo: function () {
            return '1000001';
        },
        getCustomer: function () {
            return Customer.baseCustomerMock();
        },
        getPaymentInstruments: function () {
            return {
                iterator: function () {
                    return {
                        hasNext: function () { return; } };
                }
            };
        },
        getAdjustedMerchandizeTotalGrossPrice: function () {
            return {
                add: function () {
                    return { valueOrNull: 1230 };
                }
            };
        },
        getAdjustedMerchandizeTotalNetPrice: function () {
            return {
                valueOrNull: 1230,
                add: function () {
                    return { valueOrNull: 1230 };
                }
            };
        },
        getMerchandizeTotalNetPrice: function () {
            return {
                subtract: function () {
                    return {
                        add: function () {
                            return { valueOrNull: 1230 };
                        }
                    };
                },
                add: function () {
                    return { valueOrNull: 1230 };
                }
            };
        },
        getAdjustedMerchandizeTotalTax: function () {
            return {
                valueOrNull: 1230,
                add: function () {
                    return { valueOrNull: 1230 };
                }
            };
        },
        getAdjustedMerchandizeTotalPrice: function () {
            return {
                valueOrNull: 1230,
                value: 1230,
                add: function () {
                    return {
                        valueOrNull: 1230,
                        value: 1230
                    };
                },
                subtract: function () {
                    return;
                }
            };
        },
        getAdjustedShippingTotalPrice: function () {
            return {
                valueOrNull: 1230,
                available: true
            };
        },
        getGiftCertificateTotalPrice: function () {
            return { valueOrNull: 0 };
        },
        getGiftCertificateTotalNetPrice: function () {
            return { valueOrNull: 1230 };
        },
        getGiftCertificateTotalTax: function () {
            return { valueOrNull: 1230 };
        }
    };

    if (obj) {
        return Object.assign(params, obj);
    }

    return params;
}

module.exports = {
    baseOrderMock: baseOrderMock
};
