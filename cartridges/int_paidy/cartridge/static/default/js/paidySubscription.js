'use strict';

(function($) {
  // process only when payment method is Paidy(定期)
  var buttonSelector = '.submit-order button[type="submit"]';
  var paidyPayment = $('input[name="selected_payment_method"]');
  if (paidyPayment.length == 0 || paidyPayment.val() !== 'PAIDY_SUBSCRIPTION') {
    return;
  } else {
    disableSubmitBtn(buttonSelector);
  }

  var paidyConfig = {};
  var paidyHandler = null;

  // loadイベント
  $(window).on('load', function() {
    getPaidySubscriptionConfig();
    if (!$('div.error-form').length) enableSubmitBtn(buttonSelector);
  });

  // clickイベント
  $(buttonSelector).on('click', function(e) {
    // トークンが取得できなかった場合のみ、paidyPay()を続けて呼び出す。
    if (!paidyConfig.paidyToken) {
      e.stopPropagation();
      e.preventDefault();
      paidyPay();
    }
  });

  /**
   * Paidyスクリプト定義
   * Define a Paidy script
   */
  function getPaidySubscriptionConfig() {
    $.ajaxSetup({ async: false });
    $.getJSON(Urls.getPaidySubscriptionConfig, function(data) {
      if (!data || !data.success) {
        return;
      }

      paidyConfig = data.paidyConfig;
      paidyConfig.config.closed = paidyCloseCallBack;
    });

    paidyHandler = Paidy.configure(paidyConfig.config);
  }

  /**
   * Process a new Paidy(subscription) payment
   */
  function paidyPay() {
    paidyHandler.launch(paidyConfig.payload);

    // if the execution time exceeded 300(s)
    // display timeout error message, close Paidy checkout popup and deactivate the PlaceOrder button
    displayErrorMsg();
  }

  /**
   * Display an error message for a certain period of time
   */
  function displayErrorMsg() {
    var timeOut = 0;
    timeOut = parseInt(paidyConfig.paidy_time_out_second);
    if (timeOut === 0 || isNaN(timeOut)) {
      return;
    }
  }

  /**
   * Processing execute when PaidyPopup is closed
   * @param {Object}
   */
  function paidyCloseCallBack(rs) {
    switch (rs.status) {
      case 'active':
        // get token id
        paidyConfig.paidyToken = rs.id;
        // set this token to paidyToken attribute of system object Profile
        $.ajaxSetup({ async: false });
        $.getJSON(
          Urls.setPaidySubscriptionToken,
          { tokenid: paidyConfig.paidyToken },
          function(data) {
            if (data && data.success) {
              $(buttonSelector).click();
            }
          }
        );
        break;
      default:
        break;
    }
  }

  /**
   * Disable button press
   * @param {string} buttonSelector
   */
  function disableSubmitBtn(buttonSelector) {
    if (!$(buttonSelector).prop('disabled')) {
      $(buttonSelector).prop('disabled', true);
    }
  }

  /**
   * Enable button press
   * @param {string} buttonSelector
   */
  function enableSubmitBtn(buttonSelector) {
    $(buttonSelector).removeClass('disabled');
    $(buttonSelector).prop('disabled', false);
  }
})(jQuery);
