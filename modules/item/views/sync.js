define(['marionette', 'text!./templates/sync.html', 'jquery'],
    function(Marionette, Html, $) {
        var Errors = {
            EMAIL_TAKEN: "Указанный Email уже занят.",
            INVALID_EMAIL: "Неверный Email.",
            INVALID_PASSWORD: "Неверный пароль.",
            INVALID_USER: "Указанный пользователь не существует",
            NETWORK_ERROR: "Ошибка соединения",
        };

        var View = Marionette.ItemView.extend({
            template: _.template(Html),
            ui: {
                login: '#login',
                logoff: '#logoff',
                email: '#email',
                password: '#password',
                error: '#error',
                error_text: '#error-text',
            },
            triggers: {
                'click .js-register': 'sync:register',
                'click .js-login': 'sync:login',
                'click .js-logoff': 'sync:logoff',
                'click .js-facebook': 'sync:facebook',
                'click .js-twitter': 'sync:twitter',
                'click .js-github': 'sync:github',
                'click .js-google': 'sync:google',
                'click .js-remove-data': 'sync:remove:data',
                'click .js-remove-user': 'sync:remove:user',
            },
            initialize: function(options) {
                this.Sync = options.sync;
                this.Notify = options.notify;
                this.logged = this.Sync.isActive();
            },
            onRender: function(view) {
                if (view.logged) view.ui.logoff.show()
                else view.ui.login.show();
            },

            showError: function(error) {
                var text = Errors[error.code] || error.message;
                this.ui.error_text.html(text);
                this.ui.error.show();
            },

            onSyncFacebook: function(event) {
                // console.log("facebook");
                var view = event.view;
                view.Sync.loginFacebookAsync().done(function(authData) {
                    view.setLogged(authData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },

            onSyncTwitter: function(event) {
                // console.log("Twitter");
                var view = event.view;
                view.Sync.loginTwitterAsync().done(function(authData) {
                    view.setLogged(authData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },            

            onSyncGithub: function(event) {
                // console.log("github");
                var view = event.view;
                view.Sync.loginGitHubAsync().done(function(authData) {
                    view.setLogged(authData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },            

            onSyncGoogle: function(event) {
                // console.log("google");
                var view = event.view;
                view.Sync.loginGoogleAsync().done(function(authData) {
                    view.setLogged(authData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },            

            setLogged: function(userId) {
                this.ui.error.hide();
                this.Sync.setUserId(userId);
                if (userId) {
                    this.logged = true;

                    this.Sync.start();
                } else {
                    this.logged = false;

                    this.Sync.stop();
                }
                this.render();

            },

            onSyncLogin: function(event) {
                var view = event.view;
                var email = view.ui.email.val();
                var password = view.ui.password.val();
                view.Sync.loginAsync(email, password).done(function(authData) {
                    view.setLogged(authData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },

            onSyncLogoff: function(event) {
                var view = event.view;
                view.Sync.logoffAsync().done(function(authData) {
                    view.setLogged(null);
                }).fail(function(error) {
                    view.showError(error);
                });
            },

            onSyncRegister: function(event) {
                var view = event.view;
                var email = view.ui.email.val();
                var password = view.ui.password.val();
                view.Sync.registerAsync(email, password).done(function(userData) {
                    view.setLogged(userData.uid);
                }).fail(function(error) {
                    view.showError(error);
                });
            },

            onSyncRemoveUser: function(event) {
                var view = event.view;
                var email = view.ui.email.val();
                var password = view.ui.password.val();
                view.Sync.removeUserAsync(email, password).done(function(authData) {
                    view.setLogged();
                    if (view.Notify) {
                        Notify({
                            text: 'Пользователь удален',
                            type: 'success',
                        })
                    }
                }).fail(function(error) {
                    view.showError(error);
                });
            },

            onSyncRemoveData: function(event) {
                var view = event.view;
                view.Sync.removeUserData().done(function(authData) {
                    view.setLogged();
                    if (view.Notify) {
                        Notify({
                            text: 'Данные удалены',
                            type: 'success',
                        })
                    }
                }).fail(function(error) {
                    view.showError(error);
                });
            },
        });

        return View;
    });
