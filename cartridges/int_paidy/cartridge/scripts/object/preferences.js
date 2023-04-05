'use strict';

/**
 * Payment Method Types
 */
function PaymentType() {}

PaymentType.paidyStandard = 'PAIDY_STANDARD';
PaymentType.paidySubscription = 'PAIDY_SUBSCRIPTION';

module.exports = {
    PaymentType: PaymentType
};
