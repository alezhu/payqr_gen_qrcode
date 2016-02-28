define(['jquery', 'https://apis.google.com/js/client.js'], function($) {
    var init = false;


    function _wait(check, run) {
        if (check()) {
            run();
        } else {
            setTimeout(function() {
                _wait(check, run);
            }, 1);
        }
    }

    function _waitGapiClient() {
        var result = $.Deferred();
        _wait(function() {
            return gapi && gapi.client;
        }, function() {
            result.resolve();
        })
        return result.promise();
    }

    function _waitGapiURLShortener() {
        var result = $.Deferred();
        _wait(function() {
            return gapi && gapi.client && gapi.client.urlshortener;
        }, function() {
            result.resolve();
        })
        return result.promise();
    }


    var GAPI = {
        getShortUrlAsync: function(url) {
            var result = $.Deferred();
            _waitGapiClient().done(function() {
                // console.log('Google API loaded');
                gapi.client.setApiKey("AIzaSyD97PZ41Y9kfGvuITDvcjP_mxeamvvzeV8");
                gapi.client.load("urlshortener", "v1");
                init = true;
                _waitGapiURLShortener().done(function() {
                    var request = gapi.client.urlshortener.url.insert({
                        resource: {
                            longUrl: url
                        }
                    });
                    request.execute(function(response) {
                        result.resolve({ response: response, shortUrl: response.id });
                    });

                })
            });
            return result.promise();
        }
    };
    return GAPI;
});
