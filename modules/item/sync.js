define(['require', 'jquery', 'underscore'], function(require, $, _) {
    var userIdKey = 'sync.user.id';
    var appUrl = 'payqr.firebaseIO.com';
    var ref = undefined;

    function getDbAsync() {
        var d = $.Deferred();
        if (ref) {
            d.resolve(ref)
        } else {
            require(['https://cdn.firebase.com/js/client/2.4.1/firebase.js'], function() {
                ref = new Firebase(appUrl);
                d.resolve(ref);
            })
        }
        return d.promise();
    }

    function local2fb(data, model) {
        if (!data.data) {
            console.log('Error');
        }
        return {
            title: data.title || '',
            data: data.data || '',
            updated: data.updated || ((model) ? model.getNewId() : ''),
        };
    }

    function fb2local(fbitem) {
        if (!fbitem.data) {
            console.log('Error');
        }
        return {
            title: fbitem.title,
            data: fbitem.data,
            updated: fbitem.updated,
        };
    }


    function loginOAuthAsync(provider) {
        var d = $.Deferred();
        getDbAsync().done(function(ref) {
            // prefer pop-ups, so we don't navigate away from the page
            ref.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    if (error.code === "TRANSPORT_UNAVAILABLE") {
                        // fall-back to browser redirects, and pick up the session
                        // automatically when we come back to the origin page
                        ref.authWithOAuthRedirect(provider, function(error) {
                            if (error) {
                                console.log("Login Failed!", error);
                            } else {
                                // We'll never get here, as the page will redirect on success.
                            }
                        });
                    } else {
                        d.reject(error);
                    }
                } else if (authData) {
                    // user authenticated with Firebase
                    d.resolve(authData)
                }
            });
        });
        return d.promise();
    };


    var Sync = {
        getItemsAsync: undefined,
        getUserId: function() {
            return localStorage[userIdKey] || '';
        },
        setUserId: function(userId) {
            if (userId) {
                localStorage[userIdKey] = userId;
            } else {
                localStorage.removeItem(userIdKey);
            }
        },
        isActive: function() {
            return this.getUserId() != '';
        },

        initialize: function(getItemsAsync) {
            this.getItemsAsync = getItemsAsync;
        },

        start: function() {
            if (!this.getItemsAsync) return;
            var userId = this.userId = this.getUserId();
            if (this.userId == '') return;
            this.getItemsAsync().done(function(items) {
                getDbAsync().done(function(ref) {
                    var fbItems = ref.child('users/' + userId + '/items');
                    var update = [];
                    var state = {};
                    for (var i = items.models.length - 1; i >= 0; i--) {
                        var item = items.models[i];
                        var obj = item.toJSON();
                        state[obj.id] = {
                            id: obj.id,
                            _obj: obj,
                            model: item,
                        };
                    };
                    fbItems.once('value', function(snap) {
                        if (snap.exists()) {
                            snap.forEach(function(fbitem) {
                                var id = fbitem.key();
                                var value = fbitem.val();
                                if (state[id]) {
                                    state[id].fbitem = value;
                                } else {
                                    state[id] = {
                                        id: id,
                                        fbitem: value
                                    };
                                }
                            });
                        }
                        $.each(state, function(name, value) {
                            var st = value;
                            if (!st.fbitem) {
                                fbItems.child(st.id).set(local2fb(st._obj, items.model));
                            } else if (!st.model) {
                                items.create(_.extend({ id: st.id }, fb2local(st.fbitem)), { no_auto_updated: true });
                            } else {
                                if (st._obj.updated == undefined || st._obj.updated < st.fbitem.updated) {
                                    st.model.save(fb2local(st.fbitem), { no_auto_updated: true });
                                } else if (st._obj.updated > st.fbitem.updated || st.fbitem.updated == undefined) {
                                    fbItems.child(st.id).set(local2fb(st._obj, items.model));
                                }
                            }
                        });
                        fbItems.on('child_changed', function(snap, prevKey) {
                            var key = snap.key();
                            var val = snap.val();
                            items.get(key).save(fb2local(val), { no_auto_updated: true });
                        });
                        fbItems.on('child_added', function(snap, prevKey) {
                            var key = snap.key();
                            if (!items.get(key)) {
                                var val = snap.val();
                                items.create(_.extend({ id: key }, fb2local(val)), { no_auto_updated: true });
                            }
                        });
                        fbItems.on('child_removed', function(snap) {
                            var key = snap.key();
                            items.remove(key);
                        });
                    });
                    items.on('change', function(model) {
                        var data = model.toJSON();
                        fbItems.child(data.id).set(local2fb(data));
                    }, this);
                    items.on('add', function(model) {
                        var data = model.toJSON();
                        fbItems.child(data.id).set(local2fb(data));
                    }, this);
                    items.on('remove', function(model) {
                        var data = model.toJSON();
                        fbItems.child(data.id).set(null);
                    }, this);
                    items.on('reset', function() {
                        var state = {};
                        for (var i = items.models.length - 1; i >= 0; i--) {
                            var model = items.models[i];
                            state[model.id] = local2fb(model.toJSON());
                        };
                        fbItems.set(state);
                    }, this);
                })
            });

        },

        stop: function() {},

        loginAsync: function(email, password) {
            var d = $.Deferred();
            getDbAsync().done(function(ref) {
                ref.authWithPassword({
                    email: email,
                    password: password
                }, function(error, authData) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(authData);
                    }
                });
            });
            return d.promise();
        },

        logoffAsync: function() {
            var d = $.Deferred();
            getDbAsync().done(function(ref) {
                ref.unauth();
                d.resolve();
            });
            return d.promise();
        },

        removeUserDataAsync: function() {
            var d = $.Deferred();
            getDbAsync().done(function(ref) {
                var authData = ref.getAuth();
                if (authData && authData.uid) {
                    ref.child('users/' + authData.uid).set(null);
                    Sync.setUserId();
                }

                ref.unauth();
                d.resolve();
            });
            return d.promise();
        },

        removeUserAsync: function(email, password) {
            var d = $.Deferred();
            getDbAsync().done(function(ref) {
                ref.removeUser({
                    email: email,
                    password: password
                }, function(error, authData) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(authData);
                    }
                });
            });
            return d.promise();
        },


        registerAsync: function(email, password) {
            var d = $.Deferred();
            getDbAsync().done(function(ref) {
                ref.createUser({
                    email: email,
                    password: password
                }, function(error, userData) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(userData);
                    }
                });
            });
            return d.promise();
        },

        loginFacebookAsync: function() {
            return loginOAuthAsync('facebook');
        },

        loginTwitterAsync: function() {
            return loginOAuthAsync('twitter');
        },

        loginGitHubAsync: function() {
            return loginOAuthAsync('github');
        },
        loginGoogleAsync: function() {
        	return loginOAuthAsync('google');
        },
    };
    return Sync;
});
