// FAQページのスキーママークアップ
document.addEventListener('DOMContentLoaded', function() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
                "@type": "Question",
                "name": "カレンダーはどのくらいの頻度で更新されますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "公式発表があり次第、翌日〜数日以内に更新しています。特に新しいコンサートやリリースイベントの情報は迅速に反映するよう努めています。"
                }
            },
            {
                "@type": "Question",
                "name": "過去のイベント情報も見ることはできますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "はい、カレンダーの月表示で過去の月に移動することで、過去のイベント情報も確認できます。ただし、公式サイトから削除されたイベントの情報は、カレンダー上でも削除されます。"
                }
            },
            {
                "@type": "Question",
                "name": "どのグループの情報が掲載されていますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "モーニング娘。'26、アンジュルム、Juice=Juice、つばきファクトリー、BEYOOOOONDS、OCHA NORMA、ロージークロニクル、ハロプロ研修生など、ハロー！プロジェクト所属の全グループの情報を掲載しています。グループごとにフィルタリングして表示することも可能です。"
                }
            },
            {
                "@type": "Question",
                "name": "スマホでも使えますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "はい、スマートフォン、タブレット、PCなど、あらゆるデバイスで快適にご利用いただけます。さらに、ホーム画面に追加することでアプリのように使うこともできます。PWA（Progressive Web App）技術を採用しているため、一度読み込んだ情報はオフラインでも閲覧可能です。"
                }
            },
            {
                "@type": "Question",
                "name": "ライブやイベントのチケットは購入できますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "当サイトでは直接チケットの販売は行っていません。イベント情報の確認用としてご利用いただき、チケット購入は各公式サイトやプレイガイドをご利用ください。イベントをタップすると詳細情報が表示され、公式情報へのリンクがある場合もあります。"
                }
            },
            {
                "@type": "Question",
                "name": "公式サイトとの違いは何ですか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "公式サイトが各グループごとに情報を掲載しているのに対し、当サイトはハロー！プロジェクト全体のイベントをひとつのカレンダーにまとめて表示しています。これにより、複数のグループを応援しているファンの方々が一目で全体のスケジュールを把握できます。"
                }
            },
            {
                "@type": "Question",
                "name": "通知機能はありますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "現在、イベント前の通知機能は実装していませんが、今後の機能追加を検討中です。現時点では、イベント情報をシェア機能を使ってメモアプリやカレンダーアプリに保存いただくことで、ご自身の端末の通知機能をご利用いただけます。"
                }
            },
            {
                "@type": "Question",
                "name": "イベント情報をシェアすることはできますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "はい、各イベントには「シェア」ボタンがあり、SNSやメッセージアプリで友人と簡単に情報を共有できます。また、特定の日のすべてのイベントを一度にシェアすることも可能です。シェアする際は、イベント名、日時、場所などの基本情報が自動的に整形されます。"
                }
            },
            {
                "@type": "Question",
                "name": "このサイトは公式サイトですか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "いいえ、当サイトはファンが作成した非公式のサイトです。情報は公式発表を元に作成していますが、最新かつ正確な情報については各グループの公式サイトをご確認ください。ファンとしての視点から、使いやすく便利なツールを目指して運営しています。"
                }
            },
            {
                "@type": "Question",
                "name": "データはどこから取得していますか？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ハロー！プロジェクトのオフィシャルサイトの公式情報を元にデータを作成しています。情報の正確性には細心の注意を払っていますが、常に公式情報との照合をお願いします。"
                }
            }
        ]
    };

    // スキーママークアップをページに追加
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
});