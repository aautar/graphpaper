const UUID = {
    v4: function() {
        // From https://stackoverflow.com/a/2117523
        // Note that quality of Math.random() may be a concern
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

export { UUID }
