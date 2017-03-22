/*global require*/
'use strict';

// Require allows us to configure shortcut alias
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'localstorage': {
            deps: ['backbone'],
            exports: 'Store'
        },

    },
    paths: {
        'localstorage': ['https://cdn.rawgit.com/jeromegn/Backbone.localStorage/b6530126/build/backbone.localStorage.min.js','https://rawgit.com/jeromegn/Backbone.localStorage/master/build/backbone.localStorage.min.js'],
        'jquery.ui': 'https://yastatic.net/jquery-ui/1.11.2/jquery-ui.min',
        'jquery.validate': ['https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.15.0/jquery.validate.min','https://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min'],
        'jquery.deserialize': ['https://cdn.rawgit.com/kflorence/jquery-deserialize/master/src/jquery.deserialize','https://rawgit.com/kflorence/jquery-deserialize/master/src/jquery.deserialize'],
    }
});


define(['require', 'jquery', 'localstorage', './sync'], function(require, $, LocalStorage, Sync) {
    // console.log('module:item:define');

    var setStorage = function(obj) {
        obj.localStorage = new LocalStorage("alezhu.payqr.gen.items"),
            obj.url = 'items';
    }

    var items;
    var OLD_IMPORTED = 'old_imported';
    var getItemsAsync = function() {
        var result = $.Deferred();
        if (items === undefined) {
            require(['./collections/items'], function(ItemCollection) {
                items = new ItemCollection();
                setStorage(items);
                items.fetch();
                var old = localStorage[OLD_IMPORTED] || 0;
                if (!old) {
                    require(['./old_storage'], function(OldStorage) {
                        OldStorage.fetchCollection(items);
                    });
                    localStorage[OLD_IMPORTED] = 1;
                }
                result.resolve(items);
            });
        } else {
            result.resolve(items);
        }
        return result.promise();
    }

    var showItems = function(region) {
        require(['./views/items', 'blob', 'file_saver', 'json'], function(ItemsView, Blob, FileSaver, JSON) {
            getItemsAsync().done(function(items) {
                var view = new ItemsView({
                    collection: items,
                    canExport: (Blob && FileSaver) || (typeof saveTextAs !== 'indefined'),
                });
                view.on('childview:item:qrcode', function(event) {
                    showQRCode(event.model.get('data'));
                });
                view.on('childview:item:share', function(event) {
                    shareItem(event.model);
                });
                view.on('childview:item:rename', function(event) {
                    getTitleAsync(event.model).done(function(item) {
                        if (item.save()) {}
                    });
                });
                view.on('childview:item:copy', function(event) {
                    var newItem = event.model.clone();
                    newItem.set('id', newItem.constructor.getNewId());
                    getTitleAsync(newItem).done(function(item) {
                        items.add(item);
                        if (item.save()) {

                        }
                    });
                });
                view.on('childview:item:export', function(event) {
                    // console.log('export');
                    var item = event.model;
                    var items = [item];
                    var data = JSON.stringify(items);
                    var filename = "PayQR_templates.txt";
                    try {
                        if (FileSaver) {
                            var blob = new Blob([data], { type: "application/json;charset=utf-8" });
                            FileSaver(blob, filename);
                        } else {
                            saveTextAs(data, filename);
                        }
                        showNotify({
                            text: 'Шаблон экспортированы',
                            type: 'success',
                        });
                    } catch (e) {
                        showNotify({
                            text: 'При экспорте возникли ошибки',
                            type: 'danger',
                        });
                    }
                });

                view.on('childview:item:delete', function(event) {
                    confirmAsync({
                        text: 'Вы действительно хотите удалить шаблон?'
                    }).done(function() {
                        event.model.destroy();
                    });
                });
                region.show(view);
            });
        });
    }

    var confirmAsync = function(options) {
        var result = $.Deferred();
        require(['./views/confirm'], function(ConfirmView) {
            var view = new ConfirmView(options);
            view.on('confirm:ok', function(event) {
                result.resolve();
            });
            view.on('confirm:cancel', function(event) {
                result.reject();
            });
            view.show();
        });
        return result.promise();
    }

    var showQRCode = function(data) {
        require(['./views/qrcode'], function(ItemQRCodeView) {
            var view = new ItemQRCodeView();
            view.show(data);
        });
    }

    var shareItem = function(item) {
        require(['./views/share'], function(ShareView) {
            var view = new ShareView();
            view.show(item);
        });
    }

    var showItem = function(id, region) {
        require(['./models/item', './views/detail', './import_export'], function(ItemModel, ItemDetailView, ImportExport) {
            var item = new ItemModel({ id: id });
            setStorage(item);
            item.fetch();
            var view = new ItemDetailView({
                model: item,
                canExport: ImportExport.canExport,
            });
            view.on('item:save', function(event) {
                if (event.view.ui.form.valid()) {
                    event.model.set('data', event.view.ui.form.serialize());
                    if (event.model.save()) {
                        window.history.back();
                    }
                };
            });
            view.on('item:qrcode', function(event) {
                if (event.view.ui.form.valid()) {
                    var data = event.view.ui.form.serialize();
                    showQRCode(data);
                };
            });
            view.on('item:share', function(event) {
                var data = event.view.ui.form.serialize();
                var item = new ItemModel({
                    // id: event.model.id,
                    title: event.model.get('title') || 'Новый',
                    data: data,
                })
                shareItem(item);
            });
            view.on('item:export', function(event) {
                var data = event.view.ui.form.serialize();
                var item = new ItemModel({
                    // id: event.model.id,
                    title: event.model.get('title') || 'Новый',
                    data: data,
                })
                if (ImportExport.Export([item])) {
                    showNotify({
                        text: 'Шаблон экспортирован',
                        type: 'success',
                    });
                } else {
                    showNotify({
                        text: 'При экспорте возникли ошибки',
                        type: 'danger',
                    });
                }
            });

            region.show(view);
        });
    }

    var showNewItem = function(region) {
        require(['./models/item', './views/detail'], function(ItemModel, ItemDetailView) {
            var item = new ItemModel();
            setStorage(item);
            var view = new ItemDetailView({
                model: item
            });
            view.on('item:share', function(event) {
                var data = event.view.ui.form.serialize();
                var item = new ItemModel({
                    // id: event.model.id,
                    title: event.model.get('title') || 'Новый',
                    data: data,
                })
                shareItem(item);
            });
            view.on('item:qrcode', function(event) {
                if (event.view.ui.form.valid()) {
                    var data = event.view.ui.form.serialize();
                    showQRCode(data);
                };
            });
            view.on('item:save', function(event) {
                if (event.view.ui.form.valid()) {
                    getTitleAsync(event.model).done(function(item) {
                        if (item.save({
                                id: ItemModel.getNewId(),
                                data: event.view.ui.form.serialize()
                            })) {
                            getItemsAsync().done(function(items) {
                                items.add(item);
                                window.history.back();
                            })
                        }
                    });
                };
            });

            region.show(view);
        });
    }


    var getTitleAsync = function(item) {
        var result = $.Deferred();
        require(['./views/rename'], function(ItemRenameView) {
            var view = new ItemRenameView({
                model: item,
            });
            view.on('item:rename:ok', function(event) {
                // console.log('item:rename:ok');
                result.resolve(event.model);
            });
            view.on('item:rename:cancel', function(event) {
                // console.log('item:rename:cancel');
                result.reject(event.model);
            });

            view.show();
        });
        return result.promise();
    }

    var showImport = function(region) {
        require(['./views/import', './import_export', './old_storage'], function(ImportView, ImportExport, OldStorage) {
            getItemsAsync().done(function(items) {
                var view = new ImportView({
                    model: items,
                    canExport: ImportExport.canExport,
                    canImport: ImportExport.canImport,
                    canImportOld: OldStorage.hasData(),
                });
                //view.on('notify', showNotify);
                view.on('export', function(event) {
                    // console.log('export');
                    var items = event.model;
                    if (ImportExport.Export(items.toJSON())) {
                        showNotify({
                            text: 'Шаблоны экспортированы',
                            type: 'success',
                        });
                    } else {
                        showNotify({
                            text: 'При экспорте возникли ошибки',
                            type: 'danger',
                        });
                    }
                });

                view.on('import', function(event) {
                    // console.log('import');
                    var fileToLoad = event.view.ui.file[0].files[0];

                    var fileReader = new FileReader();
                    var view = event.view;
                    fileReader.onload = function(fileLoadedEvent) {
                        var text = fileLoadedEvent.target.result;
                        var data = JSON.parse(text);
                        var items = view.model;
                        var Item = items.model;
                        _.each(data, function(item) {
                            items.create({
                                id: Item.getNewId(),
                                title: item.title || 'Новый',
                                data: item.data || '',
                            }, { silent: true })
                        });
                        //items.save();
                        items.trigger('reset');
                        showNotify({
                            text: 'Шаблоны импортированы',
                            type: 'success',
                        });

                    };
                    fileReader.onerror = function(event) {
                        showNotify({
                            text: 'При чтении файла возникла ошибка: ' + fileReader.error,
                            type: 'danger',
                        });
                    }
                    fileReader.readAsText(fileToLoad, "UTF-8");
                });

                view.on('import_old', function(event) {
                    // console.log('import old');
                    OldStorage.fetchCollection(event.model);
                    showNotify({
                        text: 'Шаблоны импортированы',
                        type: 'success',
                    });
                });

                region.show(view);
            });
        });
    }


    var showNotify = function(options) {
        require(['jquery', 'jquery.alert'], function($) {
            $.alert(options.text, {
                autoClose: true,
                closeTime: 2001,
                type: options.type,
                position: ['top-left', [-0.42, 0]]
            })
        });
    }


    var showSync = function(region) {
        require(['./views/sync'], function(SyncView) {
            var view = new SyncView({
                sync: Sync,
                notify: showNotify,
            });
            region.show(view);
        });
    }

    Sync.initialize(getItemsAsync);
    if(Sync.isActive()){Sync.start()};

    var Module = {
        showItems: function(options) {
            if (!options || !options.region) return;
            showItems(options.region);
        },
        showItem: function(options) {
            if (!options || !options.region) return;
            if (options.id) {
                showItem(options.id, options.region)
            } else {
                showNewItem(options.region);
            }
        },
        showImport: function(options) {
            if (!options || !options.region) return;
            showImport(options.region);
        },
        showSync: function(options) {
            if (!options || !options.region) return;
            showSync(options.region);
        }
    };
    return Module;
});
