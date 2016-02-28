define(['marionette', 'underscore', 'text!./templates/rename.html', './dialog_region', 'jquery.ui'], function(Marionette, _, Html, DialogRegion) {
    var View = Marionette.ItemView.extend({
        template: _.template(Html),
        ui: {
            title: 'input#title',
        },
        triggers: {
            'click .js-ok': 'item:rename:ok',
            'click .js-cancel': 'item:rename:cancel',
        },
        show: function() {
            this.region = new DialogRegion();
            this.region.show(this);
        },
        onShow: function(argument) {
            var view = this;
            this.$el.dialog({
                modal: true,
                width: '80%',
                title: 'Название шаблона',
                close: function(event, ui) {
                    view.triggerMethod('item:rename:cancel', event);
                }
            });
        },
        onItemRenameOk: function(event) {
            event.model.set('title',this.ui.title.val());
            this.region.reset();
        },
        onItemRenameCancel: function(event) {
            this.region.reset();
        }
    });

    return View;
});
