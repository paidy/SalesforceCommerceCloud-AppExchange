/* eslint-disable no-undef */
var StringUtils = require('dw/util/StringUtils');
var Calendar = require('dw/util/Calendar');
var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var OrderPaymentInstrument = require('dw/order/OrderPaymentInstrument');

var Logger = require('dw/system/Logger');
var log = Logger.getLogger('Paidy', 'PAIDY');
var Preferences = require('*/cartridge/scripts/object/preferences');

/**
 * String format date format conversion
 * @param {string} date - Pass a date string in the following format: YYYY-MM-DDThh:mm:ss.fffZ
 * @returns {string} Date in yyyy-MM-dd format
 */
function formatDate(date) {
    if (!empty(date)) { return StringUtils.formatCalendar(new Calendar(date), 'yyyy-MM-dd'); }
    return '';
}

/**
 * Get tax-included price from an order
 * @param {Object} order - The order object created from cart at the time of settlement
 * @returns {number} Gross Price value
 */
function getGross(order) {
    return order.totalGrossPrice.available
        ? order.totalGrossPrice
        : order
            .getAdjustedMerchandizeTotalPrice(true)
            .add(order.giftCertificateTotalPrice);
}

/**
 * Get day difference of argument
 * @param {Object} d1 - Date object of comparison source, format is timestamp
 * @param {Object} d2 - Date object for comparison, Format is timestamp
 * @returns {number} days
 */
function diffDays(d1, d2) {
    var d = d1.getTime() - d2.getTime();
    return Math.floor(d / (24 * 60 * 60 * 1000));
}

/**
 * Get a buyer Information definition for API or  Get a buyer data definition for API
 * @param {Object} customer - The customer object extracted by getCustomer() from order object
 * @param {Object} now - An object containing a timestamp
 * @returns {Object} Return "buyer_data" information required for the request to PaidySubscription API
 */
function getBuyerData(customer, now) {
    if (customer.anonymous) {
        return {
            user_id: null,
            age: 0,
            order_count: 0,
            ltv: 0,
            last_order_amount: 0,
            last_order_at: 0
        };
    }
    var it = OrderMgr.searchOrders(
        'customerNo={0} AND (status={1} OR status={2} OR status={3})',
        'creationDate',
        customer.profile.customerNo,
        Order.ORDER_STATUS_NEW,
        Order.ORDER_STATUS_OPEN,
        Order.ORDER_STATUS_COMPLETED
    );
    var count = 0;
    var sum = 0;
    var latestOrder = null;

    while (it.hasNext()) {
        var o = it.next();

        // Exclude paidy order.
        if (
            empty(o.getPaymentInstruments(Preferences.PaymentType.paidyStandard)) &&
            empty(o.getPaymentInstruments(Preferences.PaymentType.paidySubscription))
        ) {
            var jt = o.getPaymentInstruments().iterator();

            while (jt.hasNext()) {
                var pi = jt.next();

                if (pi instanceof OrderPaymentInstrument) {
                    try {
                        sum += pi.paymentTransaction.amount.value;
                        ++count;
                    } catch (e) {
                        log.error(
                            'An error occurred in getBuyerData. Error message:' +
                            e.toString() +
                            '\ncustomerNo:' +
                            customer.profile.customerNo +
                            '\norderNo:' +
                            o.orderNo
                        );
                    }
                }

                if (
                    latestOrder == null ||
                    latestOrder.getExportAfter().getTime() < o.getExportAfter().getTime()
                ) {
                    latestOrder = o;
                }
            }
        }
    }

    return {
        user_id: customer.profile.customerNo,
        age: diffDays(now, customer.profile.creationDate),
        order_count: count,
        ltv: sum,
        last_order_amount: latestOrder == null ? 0 : getGross(latestOrder).value,
        last_order_at: latestOrder == null
            ? 0
            : Math.max(0, diffDays(now, latestOrder.getExportAfter()))
    };
}

module.exports = {
    formatDate: formatDate,
    getGross: getGross,
    getBuyerData: getBuyerData
};
