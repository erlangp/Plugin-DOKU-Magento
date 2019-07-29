/**
 * Copyright © 2016 Doku. All rights reserved.
 */
define(
    [
        'Magento_Checkout/js/view/payment/default',
        'jquery',
        'mage/url',
        'Magento_Ui/js/modal/alert',
        'Magento_Checkout/js/checkout-data',
        'mage/loader',
        'Magento_Checkout/js/model/totals'
    ],
    function (Component, $, url, alert, checkout, loader, totals) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'Doku_Hosted/payment/creditcard-recurring-hosted',
                setWindow: false,
                dokuObj: {},
                dokuDiv: ''
            },
            redirectAfterPlaceOrder: false,
            afterPlaceOrder: function () {
                var params = '';
                var subscribeVal;
                var isSubscribe = $('#save-cc-recurring:checkbox:checked').length > 0;
                if (isSubscribe) {
                    subscribeVal = 1;
                } else {
                    subscribeVal = 0;
                }

                if(window.checkoutConfig.payment.core.installment_activation){
                    params = '?subscribe='+subscribeVal;
                }

                $.ajax({
                    type: 'GET',
                    url: url.build('dokuhosted/payment/request')+params,
                    showLoader: true,
                    success: function (response) {
                        var dataResponse = $.parseJSON(response);

                        if (dataResponse.err == false) {
                            jQuery.each(dataResponse.result, function (i, val) {
                                if (i != 'URL') {
                                    $("#credit-card-recurring-hosted").append('<input type="hidden" name="' + i + '" value="' + val + '">');
                                } else {
                                    $("#credit-card-recurring-hosted").attr("action", val);
                                }
                            });
                            $("#credit-card-recurring-hosted").submit();
                        } else {
                            alert({
                                title: 'Payment error!',
                                content: 'Error code : ' + dataResponse.res_response_code + '<br>Please retry payment',
                                actions: {
                                    always: function () {
                                    }
                                }
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        alert({
                            title: 'Payment Error!',
                            content: 'Please retry payment',
                            actions: {
                                always: function () {
                                }
                            }
                        });
                    }
                });

//                window.location = url.build('dokuhosted/payment/request');
            },
            getDescription: function(){
                return window.checkoutConfig.payment.cc_recurring_hosted.description
            },
            isInstallmentActive: function(){
                if (window.checkoutConfig.payment.core.installment_activation == 1) {
                    return true;
                } else {
                    return false;
                }
            },
            getInstallmentBank: function () {
                return window.checkoutConfig.payment.core.installment_bank_active
            },
            getTennors: function (data, event) {
                var bankTenorList = window.checkoutConfig.payment.core.installment_tennor_configuration
                $("#tennors").remove();
                jQuery('<select class="select" id="tennors" name="tennors"></select>').appendTo("#tennor");
                jQuery.each(bankTenorList, function (i, val) {
                    if (event.target.value == val['customer_bank']) {
                        $("#tennors").append('<option value="' + val['tennor'] + '">' + parseInt(val['tennor']) + ' Months</option>');
                    }
                });
            },
            isInstallmentable: function () {
                var subtotal = totals.totals._latestValue.subtotal;
                var amountAbove = window.checkoutConfig.payment.core.installment_amount_above;

                if(subtotal > amountAbove){
                    return true;
                } else {
                    return false;
                }
            }
        });
    }
);
