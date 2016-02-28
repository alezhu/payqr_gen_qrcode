define(['marionette', './item', './item_empty'], function(Marionette, ItemView, ItemEmptyView) {
    View = Marionette.CollectionView.extend({
        tagName: "ul",
        className: "list-group",
        childView: ItemView,
        emptyView: ItemEmptyView,
        childViewOptions: function(model, index) {
            return {
                canExport: this.options.canExport,
            };
        },
    });


    return View;
});
