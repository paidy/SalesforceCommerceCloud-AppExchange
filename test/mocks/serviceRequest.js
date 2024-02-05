/* eslint-disable require-jsdoc */
'use strict';

function subscriptionRequest() {
    return {
        name: 'paidy.api.payment',
        url: '/payments',
        method: 'POST',
        data: {
            token_id: 'tok_WL0GoQwAAAoA1beX',
            amount: 12500,
            currency: 'JPY',
            description: ' ',
            store_name: 'Paidy sample store',
            buyer_data: {
                age: 29,
                order_count: 1000,
                ltv: 250000,
                last_order_amount: 20000,
                last_order_at: 20
            },
            order: {
                items: [{
                    quantity: 1,
                    id: 'PDI001',
                    title: 'Paidyスニーカー',
                    description: 'Paidyスニーカー',
                    unit_price: 12000
                }],
                tax: 300,
                shipping: 200,
                order_ref: 'your_order_ref'
            },
            metadata: {
                Platform: 'Salesforce Commerce Cloud'
            },
            shipping_address: {
                line1: 'AXISビル 10F',
                line2: '六本木4-22-1',
                state: '港区',
                city: '東京都',
                zip: '106-2004'
            }
        },
        isStringify: true
    };
}

module.exports = {
    subscriptionRequest: subscriptionRequest
};
