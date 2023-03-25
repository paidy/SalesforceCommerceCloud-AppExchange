/* eslint-disable no-undef */
'use strict';

/* Script Modules */
var app = require(require('*/package.json').controllers +
  '/cartridge/scripts/app');
var guard = require(require('*/package.json').controllers +
  '/cartridge/scripts/guard');

/**
 * Get Paidy configuration.
 */
function getPaidyConfig() {
    var responseJson = {};
    var paidyCartridge = require('*/package.json').paidyCartridge;
    responseJson = require(paidyCartridge +
    '/cartridge/scripts/paidy/regular/authorize').getPaidyConfig();

    app
        .getView({
            JSONResponse: responseJson
        })
        .render('util/responsejson');
}

/**
 * Set token_id received from Paidy API to system object Profile.
 */
function setPaidyToken() {
    var responseJson = {};
    var paidyCartridge = require('*/package.json').paidyCartridge;
    responseJson = require(paidyCartridge +
    '/cartridge/scripts/paidy/regular/authorize').setPaidyTokenToProfile(
        request.httpParameterMap.tokenid.value
    );

    app
        .getView({
            JSONResponse: responseJson
        })
        .render('util/responsejson');
}

/* Web exposed methods */
/** Get customer information.
/** Get Paidy configuration.
 * @see {@link module:controllers/PaidyRegular~getPaidyConfig} */
exports.GetPaidyConfig = guard.ensure(['get'], getPaidyConfig);
/** Set the paidy token id received from Paidy API to customer's profile.
 * @see {@link module:controllers/PaidyRegular~setPaidyToken} */
exports.SetPaidyToken = guard.ensure(['get'], setPaidyToken);
