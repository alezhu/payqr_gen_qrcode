define(['backbone'], function(Backbone) {
    function getTimestamp() {
        return new Date().toISOString().replace(/\D/g, '');
    }
    var Item = Backbone.Model.extend({
        defaults: function() {
            this.on('change:id', function(model, value, options) {
                // console.log('item:change:id');
                if (!this.attributes.updated) {
                    this.attributes.updated = this.id || getTimestamp();
                }
            });
            return {
                //id: "" + new Date().toISOString().replace(/\D/g, ''),
                title: undefined,
                data: undefined,
                updated: undefined,
            }
        },
        initialize: function() {
            this.on('change', function(model, options) {
                // console.log('item:change');
                if (!options.parse && !options.no_auto_updated) {
                    this.attributes.updated = getTimestamp();
                }
            });
        },
        validate: function(attr, options) {
            if (!attr.title) {
                return "Укажите название шаблона"
            };
        }
    }, {
        getNewId: function() {
            return getTimestamp();
        }
    });
    return Item;
});
