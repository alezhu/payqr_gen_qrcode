define(['marionette', 'jquery'], function(Marionette, $) {
	var id = 'item-dialog-region';
    if (!$('div#'+id).length) {
        $('body').append($('<div id="'+id+'"></div>'));
    }

    var DialogRegion = Marionette.Region.extend({ el: '#'+id },{ID: id});

    return DialogRegion;
});
