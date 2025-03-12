// WebP対応検出とパス生成のためのヘルパー関数
(function() {
    // WebP対応を確認するフラグ（初期値はnull）
    let supportsWebP = null;

    // WebP対応を確認する関数
    function checkWebPSupport() {
        if (supportsWebP !== null) {
            return supportsWebP;
        }

        // WebPをサポートしているかテスト
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            // canvasからWebP形式でエクスポートできるか試す
            supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        } else {
            // canvas非対応ブラウザはWebPも非対応と判断
            supportsWebP = false;
        }

        return supportsWebP;
    }

    // 画像パスを最適な形式で返す関数
    function getOptimalImagePath(basePath, withExtension = false) {
        // 元のベースパスから拡張子を除いたパスを取得
        const pathWithoutExt = basePath.replace(/\.(jpg|jpeg|png|gif)$/, '');

        // WebP対応確認
        const supportsWebP = checkWebPSupport();

        // WebP対応の場合はWebP拡張子に置き換え
        if (supportsWebP) {
            return withExtension ? `${pathWithoutExt}.webp` : `${pathWithoutExt}.webp`;
        }

        // WebP非対応の場合は元のパスを返す
        return withExtension ? basePath : pathWithoutExt + '.' + basePath.split('.').pop();
    }

    // グローバルオブジェクトに関数を公開
    window.ImageHelper = {
        checkWebPSupport: checkWebPSupport,
        getOptimalImagePath: getOptimalImagePath
    };
})();