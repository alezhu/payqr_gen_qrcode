define(['marionette', 'underscore', 'text!./templates/detail.html', 'jquery.ui', 'jquery.validate', 'jquery.deserialize'], function(Marionette, _, Html) {
    var View = Marionette.ItemView.extend({
        template: _.template(Html),
        ui: {
            title: '#title',
            form: 'form#detail',
            additional: "#additional",
        },
        triggers: {
            'click .js-save': 'item:save',
            'click .js-qrcode': 'item:qrcode',
            'click .js-export': 'item:export',
            'click .js-share': 'item:share',
        },

        parseUrlQuery: function() {
            var data = {};
            if (location.search) {
                var pair = (location.search.substr(1)).split('&');
                for (var i = 0; i < pair.length; i++) {
                    var param = pair[i].split('=');
                    data[param[0]] = param[1];
                }
            }
            return data;
        },


        onRender: function(view) {
            if (view.options.canExport) {
                view.$('.js-export').show();
            }
            if (!this.model.get('id')) {
                //New
                this.ui.title.hide()
                if (window.location.search) {
                    var params = this.parseUrlQuery();
                    var share = params['share'];
                    if (share) {
                        share = decodeURIComponent(share);
                        localStorage['share'] = share;
                        if (!window.location.origin) {
                            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
                        }
                        window.location.href = window.location.origin + window.location.pathname;
                    }
                } else {
                    share = localStorage['share'] || '';
                    if (share) {
                        this.ui.form.deserialize(share);
                        localStorage.removeItem('share');
                    }
                }
            } else {
                //Exists
                var data = this.model.get('data');
                if (data) {
                    this.ui.form.deserialize(data);
                }
            };
            this.ui.additional.accordion({
                active: false,
                collapsible: true,
                heightStyle: 'content'
            });

            var validator = this.ui.form.validate({
                onSubmit: false,
                rules: {
                    ReceiverName: {
                        required: true,
                        maxlength: 160,
                    },
                    ReceiverInn: {
                        required: true,
                        maxlength: 12,
                        minlength: 10,
                        digits: true,
                    },
                    kpp: {
                        required: true,
                        maxlength: 9,
                        minlength: 9,
                        digits: true,
                    },
                    ReceiverBic: {
                        required: true,
                        maxlength: 9,
                        minlength: 9,
                        digits: true,
                    },
                    ReceiverAccount: {
                        required: true,
                        maxlength: 20,
                        minlength: 20,
                        digits: true,
                    },
                },
                messages: {

                },
            });

        }
    });
    return View;
});
