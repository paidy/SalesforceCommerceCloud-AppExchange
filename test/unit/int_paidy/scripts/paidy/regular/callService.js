/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('SiteGenesis: Try to call service for PAIDY_REGULAR', function () {
    var serviceRequest = require('../../../../../mocks/serviceRequest');
    var serviceResponse = require('../../../../../mocks/serviceResponse');

    var CallService = proxyquire('../../../../../../cartridges/int_paidy/cartridge/scripts/paidy/regular/callService', {
        'dw/svc/LocalServiceRegistry': {
            createService: function () {
                return {
                    URL: null,
                    call: function () {
                        return {
                            ok: true,
                            object: JSON.stringify(serviceResponse.regularResponse())
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
        '*/cartridge/scripts/paidy/regular/paidyLog': {
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
        assert.equal(JSON.stringify(CallService.callService(serviceRequest.regularRequest(), expectedValue)),
            JSON.stringify(serviceResponse.regularResponse()));
    });
});
