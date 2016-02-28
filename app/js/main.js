/*global require*/
'use strict';

// Require allows us to configure shortcut alias
require.config({
    baseUrl: 'app/js',
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        'backbone.Localstorage': {
            deps: ['backbone'],
            exports: 'Store'
        },
        'blob': {
            exports: 'Blob'
        },
        bootstrap: {
            deps: ['jquery']
        },
        'jquery.alert': {
            deps: ['jquery', 'bootstrap'],
        }
    },
    paths: {
        'jquery': 'https://yastatic.net/jquery/1.12.0/jquery.min',
        'bootstrap': 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
        'underscore': ['https://yastatic.net/underscore/1.8.3/underscore-min', 'http://underscorejs.org/underscore-min'],
        'backbone': ['https://yastatic.net/backbone/1.2.3/backbone-min', 'https://cdn.rawgit.com/jashkenas/backbone/master/backbone-min'],
        'text': ['https://cdn.rawgit.com/requirejs/text/latest/text', 'https://rawgit.com/requirejs/text/latest/text'],
        'marionette': ['https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.4/backbone.marionette.min', 'http://marionettejs.com/downloads/backbone.marionette'],
        'blob': ['https://cdn.rawgit.com/eligrey/Blob.js/master/Blob', 'https://rawgit.com/eligrey/Blob.js/master/Blob'],
        'file_saver': ['https://cdn.rawgit.com/koffsyrup/FileSaver.js/master/FileSaver', 'https://rawgit.com/koffsyrup/FileSaver.js/master/FileSaver'],
        'jquery.alert': ['https://cdn.rawgit.com/gkShine/jquery-alert/master/jquery-alert', 'https://rawgit.com/gkShine/jquery-alert/master/jquery-alert.js'],
    },
    packages: [{
        name: 'item',
        location: '/modules/item',
    }]
});

require([
    'app',
    'bootstrap'
], function(App) {
    App.start();
});
