// js/schema-markup.js の内容
document.addEventListener('DOMContentLoaded', function() {
    // 基本的なウェブページとイベントシリーズの構造化データを即時追加
    addBasicSchemaMarkup();

    // カレンダーデータが読み込まれた後にイベント構造化データを生成
    // カレンダーデータの読み込み完了を検知するイベントリスナーを追加
    document.addEventListener('calendarDataLoaded', generateEventSchema);

    // データ読み込みを検知できない場合のフォールバック
    setTimeout(function() {
        generateEventSchema();
    }, 2000);
});

// 基本的な構造化データを追加する関数
function addBasicSchemaMarkup() {
    // ウェブページの基本情報
    const webpageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "ハロプロイベントカレンダー | グループ別最新ライブ・コンサート情報",
        "description": "モーニング娘。'25、アンジュルム、Juice=Juice、つばきファクトリー、BEYOOOOONDS、OCHA NORMAなどハロー！プロジェクトの最新ライブ・コンサートスケジュールを一覧表示。",
        "publisher": {
            "@type": "Organization",
            "name": "ハロプロイベントカレンダー",
            "logo": {
                "@type": "ImageObject",
                "url": "https://hello-pj.github.io/icons/icon-192x192.png"
            }
        }
    };

    // イベントコレクション情報
    const eventSeriesSchema = {
        "@context": "https://schema.org",
        "@type": "EventSeries",
        "name": "ハロー！プロジェクトイベント",
        "description": "ハロー！プロジェクト所属グループの最新ライブ・コンサートスケジュール",
        "url": "https://hello-pj.github.io/calendar",
        "organizer": {
            "@type": "Organization",
            "name": "ハロー！プロジェクト",
            "url": "https://www.helloproject.com/"
        }
    };

    // WebSite構造化データ
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ハロプロイベントカレンダー",
        "url": "https://hello-pj.github.io/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://hello-pj.github.io/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Organization構造化データ
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ハロプロイベントカレンダー",
        "url": "https://hello-pj.github.io/",
        "logo": "https://hello-pj.github.io/icons/icon-192x192.png"
    };

    // スキーママークアップをページに追加
    addSchemaToHead(webpageSchema, 'webpage-schema');
    addSchemaToHead(eventSeriesSchema, 'eventseries-schema');
    addSchemaToHead(websiteSchema, 'website-schema');
    addSchemaToHead(organizationSchema, 'organization-schema');
}

// イベントスキーママークアップを生成する関数
function generateEventSchema() {
    // グローバル変数 currentEvents がカレンダーデータとして存在していることを前提
    if (typeof currentEvents !== 'undefined' && currentEvents.length > 0) {
        // 未来の直近10件のイベントだけを抽出
        const now = new Date();
        const futureEvents = currentEvents
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 10);

        // 既存のイベントスキーママークアップがあれば削除
        const existingScripts = document.querySelectorAll('script[data-schema="event"]');
        existingScripts.forEach(script => script.remove());

        // 新しいスキーママークアップを追加
        futureEvents.forEach((event, index) => {
            const startDate = new Date(event.start);
            // 終了日時がない場合は開始日時の2時間後に設定
            const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

            const eventSchema = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": event.title,
                "startDate": startDate.toISOString(),
                "endDate": endDate.toISOString(),
                "location": {
                    "@type": "Place",
                    "name": event.location || "未定"
                },
                "performer": {
                    "@type": "MusicGroup",
                    "name": event.group || "ハロー！プロジェクト"
                },
                "organizer": {
                    "@type": "Organization",
                    "name": "ハロー！プロジェクト",
                    "url": "https://www.helloproject.com/"
                },
                "image": CalendarData && CalendarData.groupImages ?
                    CalendarData.groupImages[event.group] || "img/default_image.jpg" : "img/default_image.jpg",
                "url": "https://hello-pj.github.io/calendar"
            };

            addSchemaToHead(eventSchema, `event-schema-${index}`);
        });
    }
}

// スキーママークアップをheadに追加する関数
function addSchemaToHead(schemaObject, id) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', id);
    script.textContent = JSON.stringify(schemaObject);
    document.head.appendChild(script);
}