// https://paidy.com/docs/jp/paidycheckout.html
/* Usage: Include from cartridge/templates/default/checkout/summary/summary.isml
 * add class attribute "billing-submit" to submit button.
 <script src="${URLUtils.staticURL('paidy_standard.js')}"></script>
 */
(function(global) {
  'use strict';

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

  var paidyPay = null;

  var buttonSelector = '.submit-order button[type="submit"]';

  /**
   * Call "onPaidyReady" when the Paidy standard payment is used
   */
  function loadPaidyScript() {
    function checkPaidyScriptReady() {
      return typeof window.Paidy == 'object';
    }

    if (checkPaidyScriptReady()) onPaidyReady();
  }

  /**
   * Control  the Paidy standard payment pop-up event
   */
  function onPaidyReady() {
    var config = {
      api_key: api_key,
      logo_url: logo_url,
      closed: function() {}
    };
    if (!config['logo_url']) delete config['logo_url'];

    paidyPay = function(payload) {
      config.closed = onPaidyClosed(payload);
      var paidy = Paidy.configure(config);

      if (payload) paidy.launch(payload);

    };
    Array.prototype.forEach.call(
      document.querySelectorAll(buttonSelector),
      function(button) {
        button.addEventListener('click', onBillingButtonClick, false);
      }
    );
    Array.prototype.forEach.call(
      document.querySelectorAll(buttonSelector),
      function(button) {
        button.form.action = '#';
        button.classList.remove('disabled');
        button.removeAttribute('disabled');
      }
    );
  }

  /**
   * Process a diverge depending on the result of payment completion
   * @param {Object} payloadToPaidy
   * @returns {Object}
   */
  function onPaidyClosed(payloadToPaidy) {
    var rejected = false;

    return function(result) {
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
          var form = document.createElement('form');
          form.style.display = 'none';
          form.method = 'POST';
          form.action = Urls.doPaidyStandardPlaceOrder;

          var data = {};

          data['order_id'] = orderNo;
          data['orderNo'] = orderNo;
          data['paidyResult'] = JSON.stringify(result);
          data['payloadToPaidy'] = JSON.stringify(payloadToPaidy);
          data['order_token'] = orderToken;
          data['csrf_token'] = csrfToken;

          for (var k in data) {
            var input = document.createElement('input');
            input.name = k;
            input.value = data[k];
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();

          break;
        case 'rejected':
          rejected = true;
        case 'closed':
          // ORDER_STATUS_FAILED
          $.ajaxSetup({
            async: false
          });
          $.getJSON(
            Urls.doPaidyStandardFailOrder,
            {
              orderNo: escape(orderNo),
              csrf_token: csrfToken,
              orderToken: orderToken
            },
            function(data) {
              if (rejected) {
                Array.prototype.forEach.call(
                  document.querySelectorAll(buttonSelector),
                  function(button) {
                    button.classList.add('disabled');
                    button.setAttribute('disabled', 'disabled');
                  }
                );
              }
            }
          );

          break;
      }
    };
  }

  /**
   * Request "COSummary-Submit" to create order information
   * @param {Object}
   */
  function createOrder(cb) {
    var csrfToken = '';
    var csrf_hidden = document.getElementsByName('csrf_token');
    if (csrf_hidden.length > 0) {
      csrfToken = csrf_hidden[0].value;
    }

    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: Urls.doPaidyStandardCOSummarySubmit,
      data: {
        format: 'ajax',
        csrf_token: csrfToken
      }
    }).done(function(response) {
      try {
        if (response.status != 200) {
          throw order;
        }
      } catch (e) {
        alert(messages.errors.authorize);
        return;
      }
      if (typeof cb == 'function') cb(response.paidyPay);
    });
  }

  /**
   * Processing when the order confirmation button is pressed
   * @param {Object}
   */
  function onBillingButtonClick(e) {
    e.stopPropagation();
    e.preventDefault();
    createOrder(function(payload) {
      paidyPay(payload);
    });
  }

  document.addEventListener('DOMContentLoaded', function(event) {
    Array.prototype.forEach.call(
      document.querySelectorAll(buttonSelector),
      function(button) {
        button.classList.add('disabled');
        button.setAttribute('disabled', 'disabled');
      }
    );

    $.ajaxSetup({
      async: false
    });
    $.getJSON(Urls.getPaidyStandardPaidyConfig, function(data) {
      api_key = data.api_key;
      logo_url = data.logo_url;
      timeout = data.timeout || timeout;
      messages = data.messages || messages;

      if (data.payment_method == 'PAIDY_STANDARD') {
        loadPaidyScript();
      } else {
        Array.prototype.forEach.call(
          document.querySelectorAll('.submit-order'),
          function(form) {
            form.action = Urls.doPaidyStandardCOSummarySubmit;
          }
        );
        Array.prototype.forEach.call(
          document.querySelectorAll(buttonSelector),
          function(button) {
            button.classList.remove('disabled');
            button.removeAttribute('disabled');
          }
        );
      }
    });
  });
})(window);
