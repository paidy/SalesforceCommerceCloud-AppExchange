/**
 *
 * This script attempts to make log for payment method.
 *
*/

var Logger = require('dw/system/Logger');

/**
 * Initialize a log for Paidy payment
 */
function PaidyLog() {
    // init logger
    this.initLog = function (category, method, process) {
        this.logger = Logger.getLogger(category);
        this.categoryName = category;
        this.methodName = method;
        this.processName = process;
    };

    // write log
    this.writeLog = function (logType, logTitle, logContent, orderId, writeType) {
        var logTypeStr = '';
        var logHeader = '';
        var logFooter = '';
        var newLine = '';
        var writeContent = '';

        var logText = {
            text: {
                header: '[' + this.categoryName + '] [' + this.methodName + ']',
                footer: '[END]',
                spaceShort: '==',
                spaceLong: '========================='
            },
            type: {
                inf: '[INFO] ',
                err: '[ERROR] '
            }
        };

        var titleLength = logTitle.length;

        newLine = '\n' + logText.text.spaceShort + ' ';
        var writeOrderId = 'Order ID: ' + orderId;

        // check if write log type is Debug
        if (writeType === 0) {
            switch (logType) {
                case 0:
                    logTypeStr = logText.type.inf;
                    break;
                case 1:
                    logTypeStr = logText.type.err;
                    break;
                default:
                    logTypeStr = logText.type.inf;
                    break;
            }
        }
        var writeLogContent = logContent;
        var writeLogTitle = logTitle;
        // check if the content is multi line
        if (writeLogContent.indexOf('#') >= 0) {
            var plusSpace = '';
            var headLength = 0;
            var i = 0;

            while (writeLogContent.indexOf('#') >= 0) {
                writeLogContent = writeLogContent.replace('#', newLine);
            }

            writeLogContent += newLine + writeOrderId;

            logHeader = logText.text.spaceLong + ' ' + logText.text.header + ' ' + logTypeStr + logText.text.spaceLong;

            headLength = logHeader.length;

            for (i = 0; i < (headLength - (logText.text.footer.length + 2)) / 2; i++) {
                plusSpace += '=';
            }

            logFooter = '\n' + plusSpace + ' ' + logText.text.footer + ' ' + plusSpace;

            if (titleLength > 0) {
                var borTitle = logText.text.spaceShort;

                titleLength += (borTitle.length + 2) * 2;

                writeLogTitle = '(' + writeLogTitle + ')';
                plusSpace = '';

                i = 0;

                for (i = 0; i < (headLength - titleLength) / 2; i++) {
                    plusSpace += ' ';
                }

                writeLogTitle = '\n' + plusSpace + borTitle + ' ' + writeLogTitle + ' ' + borTitle;
            }
        } else {
            writeLogContent += '.' + writeOrderId;
            logHeader = logText.text.spaceShort + ' ' + logText.text.header + ' ' + logTypeStr + ' ';
            logFooter = ' ' + logText.text.spaceShort;

            if (titleLength > 0) { writeLogTitle = '(' + writeLogTitle + ') '; }
        }

        var logDes = '== Date: ' + new Date() + ' ==\n';
        logDes += '== Description ==\n';
        writeContent = '\n\n' + logDes + logHeader + writeLogTitle + writeLogContent + logFooter + '\n';

        // set log level
        switch (writeType) {
            case 0:
                this.logger.debug(writeContent);
                break;
            case 1:
                this.logger.error(writeContent);
                break;
            default:
                this.logger.debug(writeContent);
                break;
        }
    };

    // write end for log
    this.writeEndLog = function (isSuccess, title, reason, orderId) {
        var content = '#' + this.processName + ' is ';

        if (!isSuccess) {
            this.writeLog(1, title, reason, orderId, 0);

            content += 'not ';
        }

        content += 'successful';
        content += '#Method END';

        this.writeLog(0, '', content, orderId, 0);
    };
}

module.exports = {
    PaidyLog: PaidyLog
};
