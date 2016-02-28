define(['backbone'], function(Backbone) {
    var Config = Backbone.Model.extend({
        defaults: {
            id: "main",
        }
    });
    return Config;
});
