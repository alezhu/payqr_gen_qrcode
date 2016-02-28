define(['json', 'underscore'], function(JSON, _) {
    var STORAGE_NAME = 'alezhu.payrq.gen';


    var OldStorage = {
        hasData: function(){
            try {
                return typeof localStorage[STORAGE_NAME] !== 'undefined';
            } catch(e) {
                return false;
            }
        },
        fetchCollection: function(collection) {
            try {
                var param = localStorage[STORAGE_NAME] || '';
                if (param) {
                    param = param.replace(/ReceiverKpp/g, "kpp");
                    var fav = {
                        _last: '',
                        data: {},
                    };
                    try {
                        fav = JSON.parse(param);
                        if (typeof fav[fav._last] !== 'undefined') {
                            //Old version
                            fav.data = {};
                            fav.data[fav._last] = fav[fav._last];
                            delete fav[fav._last];
                        }
                    } catch (e) {
                        fav.data[fav._last] = param;
                    }

                    _.each(fav.data, function(value, key, list) {
                        if (key) {
                            collection.create({
                                id: collection.model.getNewId(),
                                title: key,
                                data: value
                            }, { silent: true });
                        }
                    });
                    collection.trigger('reset');
                    // localStorage.removeItem(STORAGE_NAME);

                }
            } catch (e) {
                param = '';
            }
        }
    }
    return OldStorage;
});
