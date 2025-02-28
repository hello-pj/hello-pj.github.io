// サービスワーカーのサポートを確認
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorkerが登録されました。スコープ:', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker登録に失敗:', error);
            });
    });
}