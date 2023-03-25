'use strict';


function baseProfileMock(obj) {
    var params = {
        email: null,
        fax: null,
        title: null,
        addressBook: null,
        customer: null,
        companyName: null,
        firstName: null,
        jobTitle: null,
        lastName: null,
        secondName: null,
        suffix: null,
        salutation: null,
        credentials: null,
        birthday: null,
        nextBirthday: null,
        gender: null,
        preferredLocale: null,
        phoneHome: null,
        phoneBusiness: null,
        phoneMobile: null,
        lastLoginTime: null,
        lastVisitTime: null,
        previousLoginTime: null,
        previousVisitTime: null,
        taxID: null,
        taxIDMasked: null,
        taxIDType: null,
        customerNo: null,
        creationDate: null,
        custom: {
            paidyToken: ''
        },
        getEmail: function () {
            return null;
        },
        getFax: function () {
            return null;
        },
        getTitle: function () {
            return null;
        },
        getAddressBook: function () {
            return null;
        },
        getCustomer: function () {
            return null;
        },
        getCompanyName: function () {
            return null;
        },
        setCompanyName: function () {
            return null;
        },
        getFirstName: function () {
            return null;
        },
        setFirstName: function () {
            return null;
        },
        getJobTitle: function () {
            return null;
        },
        setJobTitle: function () {
            return null;
        },
        getLastName: function () {
            return null;
        },
        setLastName: function () {
            return null;
        },
        getSecondName: function () {
            return null;
        },
        setSecondName: function () {
            return null;
        },
        getSuffix: function () {
            return null;
        },
        setSuffix: function () {
            return null;
        },
        setTitle: function () {
            return null;
        },
        getSalutation: function () {
            return null;
        },
        setSaluation: function () {
            return null;
        },
        setSalutation: function () {
            return null;
        },
        getCredentials: function () {
            return null;
        },
        getBirthday: function () {
            return null;
        },
        setBirthday: function () {
            return null;
        },
        getNextBirthday: function () {
            return null;
        },
        getGender: function () {
            return null;
        },
        setGender: function () {
            return null;
        },
        isMale: function () {
            return null;
        },
        isFemale: function () {
            return null;
        },
        getPreferredLocale: function () {
            return null;
        },
        setPreferredLocale: function () {
            return null;
        },
        getPhoneHome: function () {
            return null;
        },
        setPhoneHome: function () {
            return null;
        },
        getPhoneBusiness: function () {
            return null;
        },
        setPhoneBusiness: function () {
            return null;
        },
        getPhoneMobile: function () {
            return null;
        },
        setPhoneMobile: function () {
            return null;
        },
        setFax: function () {
            return null;
        },
        getLastLoginTime: function () {
            return null;
        },
        getLastVisitTime: function () {
            return null;
        },
        getPreviousLoginTime: function () {
            return null;
        },
        getPreviousVisitTime: function () {
            return null;
        },
        getTaxID: function () {
            return null;
        },
        getTaxIDMasked: function () {
            return null;
        },
        setTaxID: function () {
            return null;
        },
        getTaxIDType: function () {
            return null;
        },
        setEmail: function () {
            return null;
        },
        getCustomerNo: function () {
            return null;
        },
        setTaxIDType: function () {
            return null;
        }
    };

    if (obj) {
        return Object.assign(params, obj);
    }

    return params;
}

module.exports = {
    baseProfileMock: baseProfileMock
};

