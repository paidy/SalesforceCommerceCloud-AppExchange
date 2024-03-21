'use strict';

function subscriptionResponse() {
    return {
        id: 'pay_WD1KIj4AALQAIMtZ',
        created_at: '2018-06-14T05:27:10.063Z',
        expires_at: '2018-07-14T05:27:10.063Z',
        amount: 12500,
        currency: 'JPY',
        description: ' ',
        store_name: 'Paidy sample store',
        test: true,
        status: 'closed',
        tier: 'classic',
        buyer: {
            name1: '山田　太郎',
            name2: 'ヤマダ　タロウ',
            email: 'yamada@paidy.com',
            phone: '818000000001'
        },
        order: {
            items: [
                {
                    id: 'PDI001',
                    title: 'Paidyスニーカー',
                    description: 'Paidyスニーカー',
                    unit_price: 12000,
                    quantity: 1
                }
            ],
            tax: 300,
            shipping: 200,
            order_ref: 'your_order_ref',
            updated_at: ' '
        },
        shipping_address: {
            line1: 'AXISビル10F',
            line2: '六本木4-22-1',
            city: '港区',
            state: '東京都',
            zip: '106-2004'
        },
        captures: [],
        refunds: [],
        metadata: {
            Platform: 'Salesforce Commerce Cloud'
        }
    };
}

module.exports = {
    subscriptionResponse: subscriptionResponse
};
