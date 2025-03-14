// お気に入り機能の管理
var EventFavorites = (function() {
    // お気に入りイベントのIDを保存するSet
    let favoriteEvents = new Set();

    // 初期化：ローカルストレージからお気に入り情報を読み込む
    function initialize() {
        // ローカルストレージをクリーンアップ（nullとundefinedを削除）
        cleanupLocalStorage();

        const storedFavorites = localStorage.getItem('hpCalendarFavorites');
        if (storedFavorites) {
            try {
                const parsedFavorites = JSON.parse(storedFavorites);
                // nullとundefinedを除外
                const validFavorites = parsedFavorites.filter(id => id !== null && id !== undefined && id !== 'null' && id !== 'undefined');
                favoriteEvents = new Set(validFavorites);
                //console.log('初期化したお気に入り:', Array.from(favoriteEvents));
            } catch (e) {
                //console.error('お気に入りデータの読み込みに失敗しました:', e);
                favoriteEvents = new Set();
            }
        }
    }

    // ローカルストレージからnullとundefinedを削除
    function cleanupLocalStorage() {
        const storedFavorites = localStorage.getItem('hpCalendarFavorites');
        if (storedFavorites) {
            try {
                const parsedFavorites = JSON.parse(storedFavorites);
                // nullとundefinedを除外
                const validFavorites = parsedFavorites.filter(id => id !== null && id !== undefined && id !== 'null' && id !== 'undefined');
                // 差異があれば保存
                if (validFavorites.length !== parsedFavorites.length) {
                    localStorage.setItem('hpCalendarFavorites', JSON.stringify(validFavorites));
                    console.log('不正なお気に入りを削除しました', parsedFavorites.length - validFavorites.length, '件');
                }
            } catch (e) {
                console.error('お気に入りデータのクリーンアップに失敗しました:', e);
            }
        }
    }

    // お気に入りに追加または削除
    function toggleFavorite(eventId) {
        // イベントIDがnullまたはundefinedの場合は処理しない
        if (!eventId || eventId === 'null' || eventId === 'undefined') {
            console.warn('有効なイベントIDが渡されませんでした:', eventId);
            return false;
        }

        // 文字列型に変換して扱う
        eventId = String(eventId);
        //console.log('toggleFavorite呼び出し - イベントID:', eventId);

        if (favoriteEvents.has(eventId)) {
            console.log('お気に入りから削除:', eventId);
            favoriteEvents.delete(eventId);
        } else {
            console.log('お気に入りに追加:', eventId);
            favoriteEvents.add(eventId);
        }

        // ローカルストレージに保存
        saveFavorites();
        //console.log('現在のお気に入り一覧:', Array.from(favoriteEvents));
        return favoriteEvents.has(eventId);
    }

    // イベントがお気に入りかどうかを確認
    function isFavorite(eventId) {
        // イベントIDが存在しない場合は false を返す
        if (!eventId || eventId === 'null' || eventId === 'undefined') return false;

        // 文字列型に変換して扱う
        eventId = String(eventId);
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

    // デバッグ用：現在のお気に入り状態をコンソールに表示
    function debugShowFavorites() {
        console.log('現在のお気に入りリスト:', Array.from(favoriteEvents));
    }

    // 公開API
    return {
        initialize: initialize,
        toggleFavorite: toggleFavorite,
        isFavorite: isFavorite,
        getAllFavorites: getAllFavorites,
        debugShowFavorites: debugShowFavorites
    };
})();

// DOMの読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', function() {
    EventFavorites.initialize();
});