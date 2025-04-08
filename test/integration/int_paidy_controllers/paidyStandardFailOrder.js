/* eslint-disable no-undef */
'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../itSG.config');

describe('SiteGenesis: Failure to order for PAIDY_STANDARD', function () {
    this.timeout(25000);
    var cookieJar = request.jar();
    var myRequest = {
        url: '',
        method: 'GET',
        json: true,
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    myRequest.url = config.baseUrl + '/PaidyStandard-FailOrder';
    myRequest.form = {};

/*
 * SiteGenesisのintegration testについて
 *
 * 前提として、SiteGenesisではSFRAと違いCSRFtokenを発行するactionが存在しない。
 *
 * 決済時のFailOrderを実行するには、以下の処理が必要になる
 *      商品のカート追加 => 配送先情報入力 => 請求先情報入力
 * 各処理を実行する際に、SiteGenesis上でCSRFTokenを生成しForm情報としてrequestする必要があるが、
 * integration test上ではCSRFTokenを生成できない。
 *
 * 上記理由から、PAIDY_STANDARD-FailOrderへrequestを実行し、
 * Responseとして、通信が成功するところまでしか確認できない
 *
 */

    // CSRFtokenが生成できない為、ResponseのstatusCodeのみを確認している
    it('should communicate successfully with SFCC server', function () {
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
            });
    });
});
