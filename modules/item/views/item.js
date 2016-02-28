define(['marionette', 'underscore', 'text!./templates/item.html'], function(Marionette, _, Html) {
    var View = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-group-item clearfix',
        template: _.template(Html),
        triggers: {
            'click .js-qrcode': 'item:qrcode',
            'click .js-rename': 'item:rename',
            'click .js-share': 'item:share',
            'click .js-copy': 'item:copy',
            'click .js-export': 'item:export',
            'click .js-delete': 'item:delete',
        },

        initialize: function(options) {
            // this.model.bind('change', this.render, this);
            this.listenTo(this.model,'change',this.render);
        },
        onRender: function(view) {
            if (view.options.canExport) {
                view.$('.js-export').show();
            }
        }

    });
    return View;
});
