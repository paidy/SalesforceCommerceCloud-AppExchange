/* eslint-disable no-undef */
/**
 * callService.js
 *
 * This script attempts to call service.
 *
*/

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');

var PaidyLog = require('*/cartridge/scripts/paidy/regular/paidyLog');


/**
* Define HTTP Services
* @param {string} - Service key obtained from asset
* @returns {Object} Returns object dw.svc.Service
*/
var paidyPaymentService = LocalServiceRegistry.createService(Site.getCurrent().getCustomPreferenceValue('paidy_service_name'), {
    createRequest: function (svc, args) {
        var serverKey = Site.getCurrent().getCustomPreferenceValue('paidy_secret_key');
        svc.addHeader('Content-Type', 'application/json');
        svc.addHeader('Accept', 'application/json');
        svc.addHeader('Authorization', 'Bearer ' + serverKey);
        svc.setEncoding('UTF-8');
        if (args.method) {
            svc.setRequestMethod(args.method);
        }
        return args.data;
    },
    parseResponse: function (svc, client) {
        return client.text;
    },
    getRequestLogMessage: function (request) {
        return request.text;
    },
    getResponseLogMessage: function (response) {
        return response.text;
    }
});

/**
 * Request to the Paidy API
 * @param {*} serviceSetting - The connection service setting information
 * @param {*} logSetting - The output log setting information
 * @returns {?Object} Returns service execution result
 */
function callService(serviceSetting, logSetting) {
    var logger = new PaidyLog.PaidyLog();

    logger.initLog(logSetting.category, logSetting.method, logSetting.process);

    try {
        var service;
        var returnData;
        var logContent = '';
        var dataPOST = {
            method: null,
            data: null
        };

        service = paidyPaymentService;
        service.URL += serviceSetting.url;

        dataPOST.method = serviceSetting.method;

        if (!empty(serviceSetting.data) && serviceSetting.isStringify) {
            dataPOST.data = JSON.stringify(serviceSetting.data);
        } else {
            dataPOST.data = serviceSetting.data;
        }

        if (!empty(serviceSetting.data)) {
            logContent += '#Send Data: ' + dataPOST.data;
        } else {
            logContent += '#Send Data: null';
        }

        logger.writeLog(0, 'Service Sending Data', logContent, logSetting.orderNo, 0);

        returnData = service.call(dataPOST);

        logContent = '';

        // set log content
        logContent += '#Service Status: ' + returnData.status;
        logContent += '#Service Code: ' + returnData.error;
        logContent += '#Service Error Message: ' + returnData.errorMessage;
        logContent += '#Service Extra Message: ' + returnData.msg;

        if (returnData.ok) {
            var data = JSON.parse(returnData.object);

            if (empty(data)) {
                logContent += '#Data: null';

                logger.writeLog(1, 'Service Return Null', logContent, logSetting.orderNo, 0);

                return null;
            }

            logContent += '#Email Address: ' + data.buyer.email;
            logContent += '#Phone Number: ' + data.buyer.phone;
            logContent += '#Data: ' + JSON.stringify(data);

            logger.writeLog(0, 'Service Return Success', logContent, logSetting.orderNo, 0);

            return data;
        }

        logger.writeLog(1, 'Service Connection Error', logContent, logSetting.orderNo, 0);
        logger.writeLog(1, 'Service Connection Error', logContent, logSetting.orderNo, 1);
    } catch (e) {
        logger.writeLog(1, 'Service Unexpected Error', e.message, logSetting.orderNo, 0);
        logger.writeLog(1, 'Service Unexpected Error', e.toString(), logSetting.orderNo, 1);

        return null;
    }

    return null;
}

/**
 * function definition only
 */
function ServiceType() { }

ServiceType.get = 'GET';
ServiceType.post = 'POST';
ServiceType.put = 'PUT';
ServiceType.del = 'DELETE';

module.exports = {
    callService: callService,
    ServiceType: ServiceType
};
