// お気に入り機能の管理
var EventFavorites = (function() {
    // お気に入りイベントのIDを保存するSet
    let favoriteEvents = new Set();

    // 初期化：ローカルストレージからお気に入り情報を読み込む
    function initialize() {
        const storedFavorites = localStorage.getItem('hpCalendarFavorites');
        if (storedFavorites) {
            try {
                const parsedFavorites = JSON.parse(storedFavorites);
                favoriteEvents = new Set(parsedFavorites);
            } catch (e) {
                console.error('お気に入りデータの読み込みに失敗しました:', e);
                favoriteEvents = new Set();
            }
        }
    }

    // お気に入りに追加または削除
    function toggleFavorite(eventId) {
        if (favoriteEvents.has(eventId)) {
            favoriteEvents.delete(eventId);
        } else {
            favoriteEvents.add(eventId);
        }
        // ローカルストレージに保存
        saveFavorites();
        return favoriteEvents.has(eventId);
    }

    // イベントがお気に入りかどうかを確認
    function isFavorite(eventId) {
        return favoriteEvents.has(eventId);
    }

    // すべてのお気に入りイベントのIDを取得
    function getAllFavorites() {
        return Array.from(favoriteEvents);
    }

    // お気に入り情報をローカルストレージに保存
    function saveFavorites() {
        const favoritesArray = Array.from(favoriteEvents);
        localStorage.setItem('hpCalendarFavorites', JSON.stringify(favoritesArray));
    }

    // 公開API
    return {
        initialize: initialize,
        toggleFavorite: toggleFavorite,
        isFavorite: isFavorite,
        getAllFavorites: getAllFavorites
    };
})();

// DOMの読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', function() {
    EventFavorites.initialize();
});