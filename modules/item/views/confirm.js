define(['marionette', 'underscore', 'text!./templates/confirm.html', './dialog_region', 'jquery.ui'], function(Marionette, _, Html, DialogRegion) {
    var View = Marionette.ItemView.extend({
        template: _.template(Html),
        ui: {
            text: '#text',
        },
        triggers: {
            'click .js-ok': 'confirm:ok',
            'click .js-cancel': 'confirm:cancel',
        },
        show: function(options) {
            this.options = this.options || options;
            this.region = new DialogRegion();
            this.region.show(this);
        },
        onShow: function(argument) {
            this.ui.text.html(this.options.text);
            this.$el.dialog({
                modal: true,
                width: '80%',
                title: this.options.title || 'Подтверждение',
                close: function(event, ui) {
                    view.triggerMethod('confirm:cancel', event);
                }
            });
        },
        onConfirmOk: function(event) {
            this.region.reset();
        },
        onConfirmCancel: function(event) {
            this.region.reset();
        }        
    });

    return View;
});
