define(['marionette'], function(Mn) {
    var App = new Mn.Application();
    App.addRegions({
        mainRegion: '#main-region'
    });

    var Router = Mn.AppRouter.extend({
        appRoutes: {
            '': 'index',
            'items': 'items',
            'item(/:id)': 'item',
            'import': 'import',
            'sync': 'sync',
            '*default': 'index'
        },

    });

    var Controller = {
        items: function() {
            require(['item'], function(ItemModule) {
                ItemModule.showItems({ region: App.mainRegion })
            });
        },
        index: function(id) {
            require(['item'], function(ItemModule) {
                ItemModule.showItem({
                    id: id,
                    region: App.mainRegion
                });
            });
        },
        item: function(id) {
            this.index(id);
        },
        import: function() {
            // console.log('app:import');
            require(['item'], function(ItemModule) {
                ItemModule.showImport({
                    region: App.mainRegion
                });
            });

        },
        sync: function() {
            // console.log('app:import');
            require(['item'], function(ItemModule) {
                ItemModule.showSync({
                    region: App.mainRegion
                });
            });
        }
    };

    Router.start = function() {
        new Router({
            controller: Controller
        });
    }

    App.on('start', function() {
        // console.log('app:start');
        require(['navbar'], function(NavBarView) {
            new NavBarView({ el: document.getElementById('menu') });
            Router.start();
            Backbone.history.start();

        });
    });



    return App;
});
