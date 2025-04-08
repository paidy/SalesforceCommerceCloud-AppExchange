'use strict';

function loginAccount() {
    // customer.xmlをインポートすることが前提のためloginEmail,loginPasswordは固定値
    return {
        loginEmail: 'yamada@paidy.com',
        loginPassword: '01234567',
        loginRememberMe: false
    };
}

function shippingAddress() {
    return {
        dwfrm_shipping_shippingAddress_addressFields_country: 'JP',
        dwfrm_shipping_shippingAddress_addressFields_postalCode: '106-2004',
        dwfrm_shipping_shippingAddress_addressFields_states_stateCode: '東京都 ',
        dwfrm_shipping_shippingAddress_addressFields_city: '港区',
        dwfrm_shipping_shippingAddress_addressFields_address1: '六本木4-22-1',
        dwfrm_shipping_shippingAddress_addressFields_address2: 'AXISビル10F',
        dwfrm_shipping_shippingAddress_addressFields_lastName: '山田',
        dwfrm_shipping_shippingAddress_addressFields_firstName: '太郎',
        dwfrm_shipping_shippingAddress_addressFields_phone: '08000000001',
        dwfrm_shipping_shippingAddress_shippingMethodID: 'Delivery',
        dwfrm_shipping_shippingAddress_isGift: null
    };
}


function billingAddress() {
    return {
        dwfrm_billing_addressFields_country: 'JP',
        dwfrm_billing_addressFields_postalCode: '106-2004',
        dwfrm_billing_addressFields_states_stateCode: '東京都 ',
        dwfrm_billing_addressFields_city: '港区',
        dwfrm_billing_addressFields_address1: '六本木4-22-1',
        dwfrm_billing_addressFields_address2: 'AXISビル10F',
        dwfrm_billing_addressFields_lastName: '山田',
        dwfrm_billing_addressFields_firstName: '太郎',
        dwfrm_billing_contactInfoFields_email: 'yamada@paidy.com',
        dwfrm_billing_contactInfoFields_phone: '08000000001',
        dwfrm_billing_paymentMethod: ''
    };
}

module.exports = {
    loginAccount: loginAccount,
    shippingAddress: shippingAddress,
    billingAddress: billingAddress
};
