define(['marionette', 'text!./templates/share.html', 'gapi', './dialog_region', 'jquery', 'jquery.ui'],
    function(Marionette, Html, GAPI, DialogRegion, $) {
        var View = Marionette.ItemView.extend({
            template: _.template(Html),
            url: '',
            title: '',
            templateHelpers: {
                url: this.shortUrl,
                title: this.title,
            },
            ui: {
                link: 'a',
            },
            show: function(item) {
                this.title = item.title;
                if (!window.location.origin) {
                    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
                }
                var url = window.location.origin + '/?share=' + encodeURIComponent(item.get('data'));
                url = url.replace(/127.0.0.1:8887/, 'alezhu.github.io/payqr_gen_qrcode');
                var view = this;
                GAPI.getShortUrlAsync(url).done(function(event) {
                    view.shortUrl = event.shortUrl;
                    var region = new DialogRegion();
                    region.show(view);
                });
            },

            onShow: function(view) {
                view.ui.link.prop('href', view.shortUrl).html(view.shortUrl);
                view.$el.dialog({
                    modal: true,
                    width: 'auto',
                    title: 'Ссылка на шаблон',
                });
            },
        });

        return View;
    });
