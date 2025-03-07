// 広告ローテーション機能
(function() {
    // 設定
    const rotationInterval = 10000; // 10秒ごとに切り替え
    let currentAdIndex = 0;
    let adSlides = [];

    // 広告ローテーションを初期化する関数
    function initAdRotation() {
        // 広告スライドを取得
        adSlides = document.querySelectorAll('.ad-slide');

        // 広告がなければ終了
        if (adSlides.length === 0) {
            console.log('広告スライドが見つかりません');
            return;
        }

        console.log('広告ローテーション初期化: ' + adSlides.length + '個の広告があります');

        // すべての広告を非表示にする
        adSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // 最初の広告を表示
        currentAdIndex = 0;
        adSlides[currentAdIndex].classList.add('active');

        // 一定時間ごとに広告を切り替える
        setInterval(rotateAds, rotationInterval);
    }

    // 広告をローテーションする関数
    function rotateAds() {
        if (adSlides.length <= 1) return;

        // 現在の広告を非表示
        adSlides[currentAdIndex].classList.remove('active');

        // 次の広告のインデックスを計算
        currentAdIndex = (currentAdIndex + 1) % adSlides.length;

        // 次の広告を表示
        adSlides[currentAdIndex].classList.add('active');

        console.log('広告切り替え: ' + (currentAdIndex + 1) + '/' + adSlides.length);
    }

    // DOMが読み込まれた後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdRotation);
    } else {
        // DOMがすでに読み込まれている場合は直接実行
        initAdRotation();
    }
})();