define(['marionette', 'underscore', 'text!./templates/item_empty.html'], function(Marionette, _, Html) {
    var View = Marionette.ItemView.extend({
        template: _.template(Html)
    });
    return View;
});
