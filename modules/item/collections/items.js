define(['backbone', './../models/item'], function(Backbone, Item ) {
    var Collection = Backbone.Collection.extend({
        model: Item,
        comparator: 'title',
    });
    return Collection;
});
