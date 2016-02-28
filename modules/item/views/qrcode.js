define(['marionette', 'underscore', 'text!./templates/qrcode.html', './dialog_region', 'jquery', 'jquery.ui'],
    function(Marionette, _, Html, DialogRegion, $) {
        var View = Marionette.ItemView.extend({
            template: _.template(Html),
            ui: {
                img: 'img#qrcode',
                error: "#error",
            },
            show: function(params) {
                this.params = params;
                this.region = new DialogRegion();
                this.region.show(this);
            },

            onShow: function(argument) {
                var view = this;
                var url = "https://payqr.ru/shop/api/1.0/receipts/qr?" + this.params;
                this.ui.img.load(function(response, status, xhr) {
                    // console.log('load');
                    view.ui.img.unbind();
                    view.ui.img.show();
                    view.$el.dialog({
                        modal: true,
                        width: 'auto',
                        title: 'QR Code',
                    });
                }).on('error', function() {
                    // console.log('load:error');
                    view.ui.img.unbind();
                    view.ui.error.show();
                    view.$el.dialog({
                        modal: true,
                        width: 'auto',
                        title: 'QR Code',
                    });
                }).attr('src', url);

                // $("#qrcode").prop("src", "https://payqr.ru/shop/api/1.0/receipts/qr?" + fav.data[fav._last]);
            },
        });

        return View;
    });
