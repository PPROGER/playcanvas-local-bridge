(function () {
    var LOCAL_PORT = 3000;
    var isLocal = window.location.search.includes('local=true');
    var app = pc.Application.getApplication();

    console.log(isLocal ? '🔧 MODE: LOCAL DEV' : '🎮 MODE: PRODUCTION');

    if (isLocal) {
        var LOCAL_ROOT = 'https://localhost:' + LOCAL_PORT;
        var fileMap = null;

        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', LOCAL_ROOT + '/file-map', false);
            xhr.send(null);
            if (xhr.status === 200) {
                fileMap = JSON.parse(xhr.responseText);
                console.log('🗺️ Map loaded from localhost');
            }
        } catch (e) {
            console.error('❌ Failed to connect to localhost. Falling back to cloud.');
        }

        if (fileMap) {
            var originalGetFileUrl = pc.Asset.prototype.getFileUrl;
            pc.Asset.prototype.getFileUrl = function () {
                var file = this.file;
                if (this.type === 'script' && file && file.filename && fileMap[file.filename]) {
                    var localPath = fileMap[file.filename];
                    console.log('✅ Override:', file.filename);
                    return LOCAL_ROOT + '/src/' + localPath + '?t=' + Date.now();
                }
                return originalGetFileUrl.call(this);
            };
        }
    }

    var assetsToLoad = app.assets.filter(function (asset) {
        if (asset.type !== 'script') return false;
        if (asset.loaded) return false;
        return true;
    });

    console.log('🔄 Bootstrap: Forcing load for ' + assetsToLoad.length + ' scripts...');

    assetsToLoad.forEach(function (asset) {
        app.assets.load(asset);
    });
})();