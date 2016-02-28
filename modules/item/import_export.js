define(['blob', 'file_saver', 'json'], function(Blob, FileSaver, JSON) {
    return {
        canExport: (Blob && FileSaver) || (typeof saveTextAs !== 'indefined'),
        canImport: (typeof FileReader !== 'indefined'),
        Export: function(data) {
            var _data = JSON.stringify(data)
            var filename = "PayQR_templates.txt";
            try {
                if (FileSaver) {
                    var blob = new Blob([_data], { type: "application/json;charset=utf-8" });
                    FileSaver(blob, filename);
                } else {
                    saveTextAs(_data, filename);
                }
                return true;
            } catch (e) {
                return false;
            }
        }
    };
});
