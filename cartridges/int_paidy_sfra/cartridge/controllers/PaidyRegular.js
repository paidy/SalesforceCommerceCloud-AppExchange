'use strict';

var server = require('server');

/**
 * Renders the paidy/authorize/get-paidy-config template.
 */
server.get('GetPaidyConfig', server.middleware.https, function (req, res, next) {
    var responseJson = require('*/cartridge/scripts/paidy/regular/authorize').getPaidyConfig(req);

    res.json(responseJson);
    next();
});

/**
 * Set token_id received from Paidy API to system object Profile.
 */
server.get('SetPaidyToken', server.middleware.https, function (req, res, next) {
    var responseJson = require('*/cartridge/scripts/paidy/regular/authorize').setPaidyTokenToProfile(
        req.querystring.tokenid,
        req
    );

    res.json(responseJson);
    next();
});

/* Web exposed methods */
module.exports = server.exports();
