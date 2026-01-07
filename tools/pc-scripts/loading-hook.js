(function () {
    var LOCAL_PORT = 3000;
    var isLocal = window.location.search.includes('local=true');

    if (!isLocal) return;

    console.log('🔧 MODE: LOCAL DEV (Hooking Asset System)');
    var LOCAL_ROOT = 'https://localhost:' + LOCAL_PORT;
    var fileMap = null;

    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', LOCAL_ROOT + '/file-map', false);
        xhr.send(null);
        if (xhr.status === 200) {
            fileMap = JSON.parse(xhr.responseText);
        }
    } catch (e) {
        console.error('❌ Localhost hook failed', e);
    }

    if (fileMap && pc.Asset && pc.Asset.prototype) {
        var originalGetFileUrl = pc.Asset.prototype.getFileUrl;
        pc.Asset.prototype.getFileUrl = function () {
            var file = this.file;
            if (this.type === 'script' && file && file.filename && fileMap[file.filename]) {
                return LOCAL_ROOT + '/src/' + fileMap[file.filename] + '?t=' + Date.now();
            }
            return originalGetFileUrl.call(this);
        };
        console.log('✅ Asset loader patched');
    }
})();