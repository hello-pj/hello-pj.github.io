// インストールバナーの表示と管理を担当するスクリプト
(function() {
    // バナー表示済みフラグをローカルストレージから取得
    const hasShownInstallBanner = localStorage.getItem('hasShownInstallBanner') === 'true';

    // インストールバナー用のHTML
    const bannerHTML = `
      <div id="pwa-install-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #0073e6; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; font-family: Arial, sans-serif; box-shadow: 0 -2px 10px rgba(0,0,0,0.2);">
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">Hello! Projectアプリをインストール</div>
          <div style="font-size: 0.9em;">ホーム画面に追加してアプリとして使用できます</div>
        </div>
        <div>
          <button id="pwa-install-button" style="background-color: white; color: #0073e6; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin-right: 8px; cursor: pointer;">インストール</button>
          <button id="pwa-close-button" style="background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">✕</button>
        </div>
      </div>
    `;

    // インストールプロンプトを保存
    let deferredPrompt;

    // インストールバナーを表示する関数
    function showInstallBanner() {
        // バナーがまだ表示されていなければ表示
        if (!hasShownInstallBanner) {
            // バナーをボディに追加
            document.body.insertAdjacentHTML('beforeend', bannerHTML);

            // インストールボタンのイベントリスナーを設定
            document.getElementById('pwa-install-button').addEventListener('click', async() => {
                // バナーを非表示
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.style.display = 'none';

                // deferredPromptがあれば、インストールプロンプトを表示
                if (deferredPrompt) {
                    deferredPrompt.prompt();

                    // ユーザーの選択結果を待つ
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`ユーザーの選択: ${outcome}`);

                    // deferredPromptは一度しか使えないので、使用後はnull設定
                    deferredPrompt = null;
                }

                // バナー表示済みフラグを保存
                localStorage.setItem('hasShownInstallBanner', 'true');
            });

            // 閉じるボタンのイベントリスナーを設定
            document.getElementById('pwa-close-button').addEventListener('click', () => {
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.style.display = 'none';

                // バナー表示済みフラグを保存
                localStorage.setItem('hasShownInstallBanner', 'true');
            });
        }
    }

    // インストール可能イベントをキャッチ
    window.addEventListener('beforeinstallprompt', (e) => {
        // デフォルトのプロンプト表示を防止
        e.preventDefault();

        // イベントを保存
        deferredPrompt = e;

        // PWAがすでにインストールされているかチェック
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('このアプリはすでにインストールされています');
            return;
        }

        // カスタムインストールバナーを表示
        showInstallBanner();
    });

    // PWAがインストールされたときのイベントリスナー
    window.addEventListener('appinstalled', () => {
        console.log('アプリがインストールされました');

        // バナーがあれば非表示
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'none';

        // deferredPromptをクリア
        deferredPrompt = null;
    });
})();