define(['backbone'], function(Backbone) {
    var View = Backbone.View.extend({
        initialize: function(options) {
            Backbone.history.on('route', function(source, path) {
                this.render(path);
            }, this);
            if (this.$el) {
                this.links = this.$el.find('a');
            }
        },
        events: {
            'click a': function(source) {
                var hrefRslt = source.target.getAttribute('href');
                Backbone.history.navigate(hrefRslt, { trigger: true });
                //Cancel the regular event handling so that we won't actual change URLs
                //We are letting Backbone handle routing
                return false;
            }
        },
        //Each time the routes change, we refresh the navigation
        //items.
        render: function(route) {
            this.links.each(function() {
                if ((route == 'index' && this.hash == '' || this.hash == '#') || this.hash == '#' + route) {
                    $(this).parent().addClass('active');
                } else {
                    $(this).parent().removeClass('active');
                }
            });
            if(this.$el.hasClass('in')){
                this.$el.collapse('hide');
            };
        }
    });
    return View;
});
