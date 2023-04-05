/* eslint-disable no-unused-vars */
'use strict';

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - object containing paymentMethod
 * @param {Object} viewFormData - Information entered in the Checkout billing form
 * @returns {Object} Returns an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
    var viewData = viewFormData;
    viewData.paymentMethod = {
        value: paymentForm.paymentMethod.value,
        htmlName: paymentForm.paymentMethod.value
    };

    if (req.form.storedPaymentUUID) {
        viewData.storedPaymentUUID = req.form.storedPaymentUUID;
    }

    viewData.paymentInformation = {};

    return {
        error: false,
        viewData: viewData
    };
}

/**
 * Save payment information
 * "req", "basket", "billingData" is undefined, but may be used by other than "int_paidy_sfra", so keep it.
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
function savePaymentInformation(req, basket, billingData) {}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
