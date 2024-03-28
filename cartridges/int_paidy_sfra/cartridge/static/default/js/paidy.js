'use strict';

(function ($) {
  var checkoutStage = $('.data-checkout-stage').attr('data-checkout-stage');
  var paidyPayment = $('.payment-information').data('selected-payment-method');
  var buttonSelector = '.next-step-button button.place-order';
  var PAIDY_STANDARD = 'PAIDY_STANDARD';
  var PAIDY_SUBSCRIPTION = 'PAIDY_SUBSCRIPTION';
  var api_key = null;
  var logo_url = null;
  var timeout = 300;
  var messages = {
    errors: {
      timeout: '',
      authorize: '',
      rejected: ''
    }
  };

  var paidyConfig = {};
  var paidyPayStandard = null;
  var paidyHandler = null;

  /**
   * Show paidy payment summary
   */
  function loadPaymentDetail() {
    $('.payment-details').show();
    $('.payment-details-summary').hide();
    if (paidyPayment.indexOf(PAIDY_STANDARD) >= 0) {
      $('.payment-details').hide();
      $('.payment-details-summary.paidy-standard').show();
    } else if (paidyPayment.indexOf(PAIDY_SUBSCRIPTION) >= 0) {
      $('.payment-details').hide();
      $('.payment-details-summary.paidy-subscription').show();
    }
  }

  /**
   * Load paidy config
   */
  function paidyLoad() {
    loadPaymentDetail();

    if (paidyPayment.indexOf(PAIDY_STANDARD) >= 0) {
      getPaidyStandardConfig();
    } else if (paidyPayment.indexOf(PAIDY_SUBSCRIPTION) >= 0) {
      getPaidySubscriptionConfig();
    }
  }

  /**
   * Load paidy standard config
   */
  function getPaidyStandardConfig() {
    disableSubmitBtn(buttonSelector);

    $.ajaxSetup({
      async: false
    });
    $.ajax({
      url: $(buttonSelector).attr('data-get-paidy-standard-config'),
      type: 'get',
      dataType: 'json',
      success: function (data) {
        api_key = data.api_key;
        logo_url = data.logo_url;
        timeout = data.timeout || timeout;
        messages = data.messages || messages;

        if (data.payment_method == PAIDY_STANDARD) {
          onPaidyReady();
        }
      }
    });
  }

  /**
   * Load paidy subscription config
   */
  function getPaidySubscriptionConfig() {
    disableSubmitBtn(buttonSelector);

    $.ajaxSetup({
      async: false
    });
    $.ajax({
      url: $(buttonSelector).attr('data-get-paidy-subscription-config'),
      type: 'get',
      dataType: 'json',
      success: function (data) {
        if (!data || !data.success) {
          return;
        }

        paidyConfig = data.paidyConfig;

        // clickイベント
        $(buttonSelector)
          .off('click')
          .on('click', function (e) {
            if (!isPaidyPay()) {
              return true;
            }

            e.stopPropagation();
            e.preventDefault();

            paidyPaySubscription();

            return false;
          });

        enableSubmitBtn(buttonSelector);
      }
    });
  }

  /**
   * Init paidy subscription popup event
   */
  function paidyPaySubscription() {
    paidyConfig.config.closed = paidyCloseCallBack;
    paidyHandler = Paidy.configure(paidyConfig.config);
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
   * Init paidy standard event
   */
  function onPaidyReady() {
    var config = {
      api_key: api_key,
      logo_url: logo_url,
      closed: function () { }
    };
    if (!config['logo_url']) delete config['logo_url'];

    paidyPayStandard = function (payload) {
      config.closed = onPaidyClosed(payload);
      var paidy = Paidy.configure(config);

      if (payload) paidy.launch(payload);

    };

    // clickイベント
    $(buttonSelector)
      .off('click')
      .on('click', function (e) {
        if (!isPaidyPay()) {
          return true;
        }

        e.stopPropagation();
        e.preventDefault();
        createOrder(function (payload) {
          paidyPayStandard(payload);
        });

        return false;
      });

    enableSubmitBtn(buttonSelector);
  }

  /**
   * Create Order
   */
  function createOrder(cb) {
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: $(buttonSelector).attr('data-action')
    }).done(function (response) {
      if ('status' in response && response.status !== 200) {
        // If an error occurs, we want to display an alert.
        // Therefore, ignore the `no-alert` lint error.
        // eslint-disable-next-line no-alert
        alert(messages.errors.authorize);
        if (response.paidyPay.order.order_ref) {
          failOrder(response.paidyPay.order.order_ref,response.paidyPay.order.order_token);
        }
        return;
      }
      if (response.error) {
        if (response.cartError) {
          window.location.href = response.redirectUrl;
        } else if (response.sessionLoginError) {
          $('#sessionTimeOutLoginModal').modal('show');
        } else {
          showErrorMessage(response.errorMessage);
        }
        return;
      }
      if (typeof cb == 'function') cb(response.paidyPay);
    });
  }

  /**
   * Paidy standard popup close event
   */
  function onPaidyClosed(payloadToPaidy) {
    var rejected = false;

    return function (result) {
      // ユーザがPaidyのポップアップを操作した後に呼ばれる。
      // レスポンス内のコード値により処理を分岐する。

      var orderNo = payloadToPaidy.order.order_ref;
      var orderToken = payloadToPaidy.order.order_token;
      var csrfToken = '';

      if ($("input[name='csrf_token']").length) {
        csrfToken = $("input[name='csrf_token']").val();
      }

      // result:{id,amount,currency,created_at,status}
      switch (result.status.toLowerCase()) {
        case 'authorized':
          $.ajaxSetup({
            async: false
          });
          $.ajax({
            type: 'get',
            dataType: 'json',
            url: $(buttonSelector).attr('data-paidy-standard-place-order'),
            data: {
              order_id: escape(orderNo),
              orderNo: escape(orderNo),
              paidyResult: JSON.stringify(result),
              payloadToPaidy: JSON.stringify(payloadToPaidy),
              order_token: orderToken,
              csrf_token: csrfToken
            },
            success: function (data) {
              placeOrderComplete(data);
            },
            error: function () {
              failOrder(orderNo);
            }
          });

          break;
        case 'rejected':
          rejected = true;
        case 'closed':
          // ORDER_STATUS_FAILED
          $.ajaxSetup({
            async: false
          });
          $.ajax({
            method: 'get',
            dataType: 'json',
            url: $(buttonSelector).attr('data-paidy-standard-fail-order'),
            data: {
              orderNo: escape(orderNo),
              csrf_token: csrfToken,
              orderToken: orderToken
            }
          }).done(function (response) {
            if (rejected) {
              disableSubmitBtn(buttonSelector);
            }
          });

          break;
      }
    };
  }

  /**
   * Paidy subscription popup close event
   */
  function paidyCloseCallBack(rs) {
    switch (rs.status) {
      case 'active':
        // get token id
        paidyConfig.paidyToken = rs.id;

        var url = $(buttonSelector).attr('data-action');
        var urlParams = { paidyToken: paidyConfig.paidyToken };

        url +=
          (url.indexOf('?') !== -1 ? '&' : '?') +
          Object.keys(urlParams)
            .map(function (key) {
              return key + '=' + encodeURIComponent(urlParams[key]);
            })
            .join('&');

        $.ajaxSetup({ async: false });
        $.ajax({
          method: 'POST',
          dataType: 'json',
          url: url
        }).done(function (data) {
          placeOrderComplete(data);
        });
        break;
      default:
        break;
    }
  }

  /**
   * Fail order
   */
  function failOrder(orderNo,orderToken) {
    var csrfToken = '';

    if ($("input[name='csrf_token']").length) {
      csrfToken = $("input[name='csrf_token']").val();
    }

    $.ajaxSetup({
      async: false
    });
    $.ajax({
      method: 'get',
      dataType: 'json',
      url: $(buttonSelector).attr('data-paidy-standard-fail-order'),
      data: {
        orderNo: escape(orderNo),
        csrf_token: csrfToken,
        orderToken: orderToken
      }
    }).done(function (response) { });
  }

  /**
   * Place order complete
   */
  function placeOrderComplete(data) {
    var defer = $.Deferred(); // eslint-disable-line
    if (data.error) {
      if (data.cartError) {
        window.location.href = data.redirectUrl;
        defer.reject();
      } else {
        // go to appropriate stage and display error message
        defer.reject(data);
        showErrorMessage(data.errorMessage);
        disableSubmitBtn(buttonSelector);
      }
    } else {
      var continueUrl = data.continueUrl;
      var urlParams = {
        ID: data.orderID,
        token: data.orderToken
      };

      continueUrl +=
        (continueUrl.indexOf('?') !== -1 ? '&' : '?') +
        Object.keys(urlParams)
          .map(function (key) {
            return key + '=' + encodeURIComponent(urlParams[key]);
          })
          .join('&');

      var $redirectFrom = $('<form>')
        .appendTo(document.body)
        .attr({
          method: 'POST',
          action: continueUrl
        }).append(
          $('<input>')
            .attr({
              name: 'orderID',
              value: data.orderID
            }),
          $('<input>')
            .attr({
              name: 'orderToken',
              value: data.orderToken
            })
        );

      $redirectFrom.submit();
      defer.resolve(data);
    }
  }

  /**
   * Check is paidy payment
   */
  function isPaidyPay() {
    return (
      paidyPayment.indexOf(PAIDY_STANDARD) >= 0 ||
      paidyPayment.indexOf(PAIDY_SUBSCRIPTION) >= 0
    );
  }

  /**
   * Disable button place order
   */
  function disableSubmitBtn(buttonSelector) {
    if (!$(buttonSelector).prop('disabled')) {
      $(buttonSelector).prop('disabled', true);
    }
  }

  /**
   * Enable button place order
   */
  function enableSubmitBtn(buttonSelector) {
    $(buttonSelector).removeClass('disabled');
    $(buttonSelector).prop('disabled', false);
  }

  /**
   * Error message display
   * @param {string} message
   */
  function showErrorMessage(message) {
    $('.alert.alert-danger.error-message').show();
    $('.error-message-text').text(message);
  }

  if (checkoutStage == 'placeOrder') {
    paidyLoad();
  }

  $(document).ready(function () {
    $('body').on('checkout:updateCheckoutView', function (e, data) {
      checkoutStage = $('.data-checkout-stage').attr('data-checkout-stage');
      paidyPayment = $('.payment-information').data('payment-method-id');
      if (checkoutStage == 'payment') {
        paidyLoad();
      }
    });
  });
})(jQuery);
