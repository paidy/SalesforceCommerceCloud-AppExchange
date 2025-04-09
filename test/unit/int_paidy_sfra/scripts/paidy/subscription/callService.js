/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SFRA: Try to call service for PAIDY_SUBSCRIPTION', function () {
    var serviceRequest = require('../../../../../mocks/serviceRequest');
    var serviceResponse = require('../../../../../mocks/serviceResponse');

    var CallService = proxyquire('../../../../../../cartridges/int_paidy_sfra/cartridge/scripts/paidy/subscription/callService', {
        'dw/svc/LocalServiceRegistry': {
            // request
            createService: function () {
                return {
                    URL: null,
                    call: function () {
                        return {
                            ok: true,
                            object: JSON.stringify(serviceResponse.subscriptionResponse())
                        };
                    }
                };
            }
        },
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function () {
                        var params = {
                            paidy_service_name: 'paidy.api.payment',
                            paidy_secret_key: 'secret_key'
                        };
                        return params.str;
                    }
                };
            }
        },
        '*/cartridge/scripts/paidy/subscription/paidyLog': {
            PaidyLog: function () {
                return {
                    initLog: function () {
                        return;
                    },
                    writeLog: function () {
                        return;
                    }
                };
            }
        }
    });

    // empty definition
    global.empty = function (params) {
        if (params) {
            return false;
        }
        return true;
    };

    it('should return the response data from the Paidy API', function () {
        var expectedValue = {
            category: 'Paidy',
            method: 'Create subscription payment',
            process: 'Payment',
            orderNo: '1000001'
        };
        assert.equal(JSON.stringify(CallService.callService(serviceRequest.subscriptionRequest(), expectedValue)),
            JSON.stringify(serviceResponse.subscriptionResponse()));
    });
});
