$(document).ready(function() {
    var STORAGE_NAME = 'alezhu.payrq.gen';
    var form = $('form');
    var fav = {
        _last: '',
        data: {},
    };
    var param = localStorage[STORAGE_NAME];;
    try {
        fav = JSON.parse(param);
        if (typeof fav[fav._last] !== 'undefined') {
            //Old version
            fav.data = {};
            fav.data[fav._last] = fav[fav._last];
            delete fav[fav._last];
        }
    } catch (e) {
        fav.data[fav._last] = param;
    }

    param = fav.data[fav._last];
    if (param) {
        form.deserialize(param);
    }

    $("#additional").accordion({
        active: false,
        collapsible: true,
    });

    var validator = form.validate({
        rules: {
            ReceiverName: {
                required: true,
                maxlength: 160,
            },
            ReceiverInn: {
                required: true,
                maxlength: 12,
                minlength: 10,
                digits: true,
            },
            ReceiverKpp: {
                required: true,
                maxlength: 9,
                minlength: 9,
                digits: true,
            },
            ReceiverBic: {
                required: true,
                maxlength: 9,
                minlength: 9,
                digits: true,
            },
            ReceiverAccount: {
                required: true,
                maxlength: 20,
                minlength: 20,
                digits: true,
            },
        },
        messages: {

        },

        submitHandler: function(form) {
            //event.preventDefault();
            //            console.log(param);

            saveForm();

            $("#qrcode").prop("src", "https://payqr.ru/shop/api/1.0/receipts/qr?" + fav.data[fav._last]);

            $("#dialog-message").dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                        $(this).dialog("close");
                    }
                }
            });
        }
    });

    function saveForm() {
        var param = form.serialize();
        fav.data[fav._last] = param;
        localStorage[STORAGE_NAME] = JSON.stringify(fav);
    }

    var domFav = $('#fav');

    function AddFav(key) {
        var name = (key === "") ? "По умолчанию" : key;
        var domLI = $('<li class="list-group-item link">').text(name).click(function() {
            domFav.find('.active').toggleClass('active');
            fav._last = $(this).addClass("active").attr("data-fav");
            var param = fav.data[fav._last];
            form[0].reset();
            validator.resetForm();
            form.deserialize(param);
        }).attr("data-fav", key);
        $('<a href="#" class="glyphicon glyphicon-remove">').click(function(event) {
            event.preventDefault();
            var li = $(this).closest('li');
            var key = li.attr('data-fav');

            var ul = li.closest('ul');

            if (key === '') {
                fav.data[key] = '';
            } else {
                delete fav.data[key];
                li.remove();
            };

            if (key === fav._last) {
                fav._last = '';
                form[0].reset();
                validator.resetForm();
                form.deserialize(fav.data[fav._last]);
                ul.find('li[data-fav=""]').addClass('active');
            };


            saveForm();

        }).appendTo($('<span class="badge">').appendTo(domLI));
        if (fav._last === key) {
            domLI.addClass("active")
        };
        domLI.appendTo(domFav);

    }

    $.each(fav.data, function(key, value) {
        AddFav(key);
    });

    $('#addFav').click(function(event) {
        event.preventDefault();
        $("#dialog-add-fav").dialog({
            modal: true,
            buttons: {
                Ok: function() {
                    var name = $(this).find('#fav-name').val().trim();
                    if (name === '') return;

                    domFav.find('li.active').toggleClass('active');
                    fav._last = name;
                    AddFav(name);

                    saveForm();

                    $(this).dialog("close");
                }
            }
        });
    });

});

if (!window.JSON) {
    window.JSON = {
        parse: function(sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: function(vContent) {
            if (vContent instanceof Object) {
                var sOutput = '';
                if (vContent.constructor === Array) {
                    for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ',', nId++);
                    return '[' + sOutput.substr(0, sOutput.length - 1) + ']';
                }
                if (vContent.toString !== Object.prototype.toString) {
                    return '"' + vContent.toString().replace(/"/g, '\\$&') + '"';
                }
                for (var sProp in vContent) {
                    sOutput += '"' + sProp.replace(/"/g, '\\$&') + '":' + this.stringify(vContent[sProp]) + ',';
                }
                return '{' + sOutput.substr(0, sOutput.length - 1) + '}';
            }
            return typeof vContent === 'string' ? '"' + vContent.replace(/"/g, '\\$&') + '"' : String(vContent);
        }
    };
}