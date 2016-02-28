define(['marionette', 'underscore', 'text!./templates/import.html'],
    function(Marionette, _, Html) {
        var View = Marionette.ItemView.extend({
            template: _.template(Html),
            triggers: {
                'click .js-import': 'import',
                'click .js-import-old': 'import_old',
                'click .js-export': 'export',
            },
            ui: {
                file: '#file',
                import_btn: '#import',
                import_valid: '#import-valid',
                import_invalid: '#import-invalid',
                export_btn: '#export',
                export_valid: '#export-valid',
                export_invalid: '#export-invalid',
                import_old_valid: '#import-old-valid',
            },
            onRender: function(view) {
                if (view.options.canExport) {
                    // console.log('export posible');
                    view.ui.export_invalid.hide();
                    view.ui.export_valid.show();
                }
                if (view.options.canImport) {
                    // console.log('import posible');
                    view.ui.import_invalid.hide();
                    view.ui.import_valid.show();
                    view.ui.file.on('change', function(event) {
                        view.ui.import_btn.prop('disabled', this.files.length == 0);
                    })
                }
                if (view.options.canImportOld) {
                    // console.log('import old posible');
                    view.ui.import_old_valid.show();
                }                

            },

        });
        return View;
    });
