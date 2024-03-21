'use strict';

var Profile = require('./Profile');

function baseCustomerMock(obj) {
    var params = {
        profile: Profile.baseProfileMock(),
        ID: null,
        customerGroups: null,
        activeData: null,
        orderHistory: null,
        productLists: null,
        addressBook: null,
        note: null,
        isRegistered: function () {
            return null;
        },
        getID: function () {
            return null;
        },
        getCustomerGroups: function () {
            return null;
        },
        getActiveData: function () {
            return null;
        },
        isExternallyAuthenticated: function () {
            return null;
        },
        isAuthenticated: function () {
            return null;
        },
        getProfile: function () {
            return null;
        },
        getOrderHistory: function () {
            return null;
        },
        isMemberOfCustomerGroup: function () {
            return null;
        },
        getProductLists: function () {
            return null;
        },
        getAddressBook: function () {
            return null;
        },
        getNote: function () {
            return null;
        },
        setNote: function () {
            return null;
        },
        isAnonymous: function () {
            return null;
        }
    };

    if (obj) {
        return Object.assign(params, obj);
    }

    return params;
}

module.exports = {
    baseCustomerMock: baseCustomerMock
};
