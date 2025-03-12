// js/schema-markup-members.js
// メンバーページとグループページ用の構造化データを提供するスクリプト

document.addEventListener('DOMContentLoaded', function() {
    // URLからページタイプを判断
    const currentPath = window.location.pathname;

    // メンバー一覧ページの場合
    if (currentPath.includes('/members')) {
        addMembersPageSchema();
    }
    // グループページの場合
    else if (currentPath.includes('/groups/')) {
        const groupId = currentPath.split('/').pop().replace('.html', '');
        addGroupPageSchema(groupId);
    }
});

// メンバー一覧ページ用スキーマを追加
function addMembersPageSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "メンバー一覧 | ハロプロメンバー検索・情報",
        "description": "モーニング娘。'25、アンジュルム、Juice=Juice、つばきファクトリー、BEYOOOOONDS、OCHA NORMAなどハロー！プロジェクト所属メンバーの詳細情報。プロフィール、誕生日、血液型、出身地など。グループ別・条件別に検索可能。",
        "url": "https://hello-pj.github.io/members",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "モーニング娘。'25",
                    "url": "https://hello-pj.github.io/groups/morningmusume.html"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "アンジュルム",
                    "url": "https://hello-pj.github.io/groups/angerme.html"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Juice=Juice",
                    "url": "https://hello-pj.github.io/groups/juicejuice.html"
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": "つばきファクトリー",
                    "url": "https://hello-pj.github.io/groups/tsubakifactory.html"
                },
                {
                    "@type": "ListItem",
                    "position": 5,
                    "name": "BEYOOOOONDS",
                    "url": "https://hello-pj.github.io/groups/beyooooonds.html"
                },
                {
                    "@type": "ListItem",
                    "position": 6,
                    "name": "OCHA NORMA",
                    "url": "https://hello-pj.github.io/groups/ochanorma.html"
                },
                {
                    "@type": "ListItem",
                    "position": 7,
                    "name": "ロージークロニクル",
                    "url": "https://hello-pj.github.io/groups/rosychronicle.html"
                },
                {
                    "@type": "ListItem",
                    "position": 8,
                    "name": "ハロプロ研修生",
                    "url": "https://hello-pj.github.io/groups/trainees.html"
                }
            ]
        }
    };

    addSchemaToHead(schema);
}

// グループページ用スキーマを追加
function addGroupPageSchema(groupId) {
    // グループ情報のマッピング
    const groupInfo = {
        'morningmusume': {
            name: 'モーニング娘。\'25',
            description: 'ハロー！プロジェクトを代表する女性アイドルグループ。1997年に結成され、現在も第15期メンバーを加えて活動中。リーダーは譜久村聖。グループの特徴である新陳代謝を繰り返しながら革新を続け、日本のアイドルシーンをリードし続けています。',
            image: '/img/morning_musume_image.jpg',
            officialUrl: 'https://www.helloproject.com/morningmusume/',
            youtubeUrl: 'https://www.youtube.com/@morningmusume',
            foundingDate: '1997-09-14'
        },
        'angerme': {
            name: 'アンジュルム',
            description: 'ハロー！プロジェクト所属のグループ。2009年にスマイレージとして結成され、2014年11月に現在の名称に改名。メンバーそれぞれの個性と実力を活かした楽曲で人気を集め、多様な音楽性と表現力で魅了しています。',
            image: '/img/angerme_image.jpg',
            officialUrl: 'https://www.helloproject.com/angerme/',
            youtubeUrl: 'https://www.youtube.com/@angerme',
            foundingDate: '2009-04-04'
        },
        'juicejuice': {
            name: 'Juice=Juice',
            description: '2013年2月に結成されたハロー！プロジェクト所属のグループ。「また一皮向けて成長するように」との願いを込めて命名。高い歌唱力と表現力を持ち、パフォーマンスの完成度の高さに定評があります。',
            image: '/img/juice_juice_image.jpg',
            officialUrl: 'https://www.helloproject.com/juicejuice/',
            youtubeUrl: 'https://www.youtube.com/@juicejuice',
            foundingDate: '2013-02-03'
        },
        'tsubakifactory': {
            name: 'つばきファクトリー',
            description: '2015年4月に結成されたハロー！プロジェクト所属のグループ。「椿の花言葉である『謙虚』と『理想の恋』を持ち合わせた女の子に成長するように」との思いから命名。清楚なイメージと洗練されたパフォーマンスが特徴です。',
            image: '/img/tsubaki_factory_image.jpg',
            officialUrl: 'https://www.helloproject.com/tsubakifactory/',
            youtubeUrl: 'https://www.youtube.com/@tsubakifactory',
            foundingDate: '2015-04-29'
        },
        'beyooooonds': {
            name: 'BEYOOOOONDS',
            description: '2018年に結成された3ユニット複合体のハロー！プロジェクト所属グループ。CHICA#TETSU、雨ノ森川海、SeasoningのユニットからなるBEYOOOOONDSは、個性的なメンバーが集まり、多彩な音楽性とユニークなパフォーマンスで注目を集めています。',
            image: '/img/beyooooonds_image.jpg',
            officialUrl: 'https://www.helloproject.com/beyooooonds/',
            youtubeUrl: 'https://www.youtube.com/@BEYOOOOONDS',
            foundingDate: '2018-10-19'
        },
        'ochanorma': {
            name: 'OCHA NORMA',
            description: '2022年に結成されたハロー！プロジェクト所属の最新グループ。「日常の中で規範となるようなグループに」との意味を込めて命名。フレッシュな魅力と高いポテンシャルを持つ新世代アイドルグループとして活動しています。',
            image: '/img/ocha_norma_image.jpg',
            officialUrl: 'https://www.helloproject.com/ochanorma/',
            youtubeUrl: 'https://www.youtube.com/@OCHANORMA',
            foundingDate: '2022-11-23'
        },
        'rosychronicle': {
            name: 'ロージークロニクル',
            description: '2023年に結成されたハロー！プロジェクト所属の新グループ。「薔薇色の年代記」という意味の名前を持ち、ハロプロ研修生からの選抜メンバーで構成されています。個性的なメンバーが集まり、今後の活動が期待されています。',
            image: '/img/rosy_chronicle_image.jpg',
            officialUrl: 'https://www.helloproject.com/rosychronicle/',
            youtubeUrl: 'https://www.youtube.com/@RosyChronicle',
            foundingDate: '2023-07-15'
        },
        'trainees': {
            name: 'ハロプロ研修生',
            description: 'ハロー！プロジェクトの次世代を担うメンバーが所属する育成組織。将来的にデビューするためのトレーニングを受けています。定期的な発表会やライブを通じて実力を磨き、ファンとの交流も大切にしています。',
            image: '/img/hello_project_trainees_image.jpg',
            officialUrl: 'https://www.helloproject.com/helloprokenshusei/',
            foundingDate: '2004-06-30'
        }
    };

    const group = groupInfo[groupId];

    if (group) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            "name": group.name,
            "description": group.description,
            "url": `https://hello-pj.github.io/groups/${groupId}.html`,
            "image": `https://hello-pj.github.io${group.image}`,
            "foundingDate": group.foundingDate,
            "genre": "J-Pop",
            "sameAs": [
                group.officialUrl
            ]
        };

        // YouTubeチャンネルがある場合のみ追加
        if (group.youtubeUrl) {
            schema.sameAs.push(group.youtubeUrl);
        }

        addSchemaToHead(schema);
    }
}

// 個別メンバーの詳細表示時のPersonスキーマ追加（モーダル表示時に呼び出す用）
function addMemberSchema(member) {
    if (!member) return;

    // グループIDを取得
    const groupPath = convertGroupNameToPath(member["グループ名"]);

    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": member["メンバー名"],
        "givenName": member["メンバー名"],
        "image": `https://hello-pj.github.io/img/members/${groupPath}/${convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"])}.jpg`,
        "birthDate": member["誕生日"] || undefined,
        "birthPlace": member["出身地"] || undefined,
        "memberOf": {
            "@type": "MusicGroup",
            "name": member["グループ名"],
            "url": `https://hello-pj.github.io/groups/${groupPath}.html`
        }
    };

    // プロフィールURLがある場合
    if (member["公式プロフィールURL"]) {
        if (!schema.sameAs) schema.sameAs = [];
        schema.sameAs.push(member["公式プロフィールURL"]);
    }

    // ブログURLがある場合
    if (member["ブログURL"]) {
        if (!schema.sameAs) schema.sameAs = [];
        schema.sameAs.push(member["ブログURL"]);
    }

    // インスタグラムURLがある場合
    if (member["インスタグラムURL"]) {
        if (!schema.sameAs) schema.sameAs = [];
        schema.sameAs.push(member["インスタグラムURL"]);
    }

    // 一意のIDでスキーマタグを生成（既存のものがあれば更新）
    const existingSchema = document.getElementById('member-schema');
    if (existingSchema) {
        existingSchema.textContent = JSON.stringify(schema);
    } else {
        const script = document.createElement('script');
        script.id = 'member-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }
}

// グループ名をパス用の英語表記に変換（members.jsの関数と同じロジック）
function convertGroupNameToPath(groupName) {
    const groupMap = {
        "モーニング娘。'25": "morningmusume",
        "アンジュルム": "angerme",
        "Juice=Juice": "juicejuice",
        "つばきファクトリー": "tsubakifactory",
        "BEYOOOOONDS": "beyooooonds",
        "OCHA NORMA": "ochanorma",
        "ロージークロニクル": "rosychronicle",
        "ハロプロ研修生": "trainees"
    };

    return groupMap[groupName] || "other";
}

// メンバー名をパス用の英語表記に変換（members.jsの関数と同じロジック）
function convertMemberNameToPath(memberName, publicProfileUrl) {
    // 公式プロフィールURLから末尾の名前部分を抽出
    if (publicProfileUrl) {
        const matches = publicProfileUrl.match(/profile\/(.+)\/?$/);
        if (matches && matches[1]) {
            // 末尾の「/」を削除
            return matches[1].replace(/\/$/, '');
        }
    }

    // URLがない場合のフォールバック
    return String(memberName)
        .toLowerCase()
        .replace(/\s+/g, '_')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '');
}

// スキーマをheadに追加する関数
function addSchemaToHead(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

// メンバー詳細モーダル表示時に構造化データを追加するためのイベントリスナー登録
// members.js内のshowMemberDetails関数から呼び出せるようにグローバルに登録
window.addMemberSchema = addMemberSchema;

// members.js内のshowMemberDetails関数にスキーマ追加コードを追加するためのフック
// members.jsが読み込まれた後に実行される
document.addEventListener('DOMContentLoaded', function() {
    // モーダルの表示イベントをフック
    const modal = document.getElementById('member-modal');
    if (modal) {
        const originalDisplay = modal.style.display;

        // MutationObserverを使用してモーダル表示を監視
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'style' &&
                    modal.style.display === 'block' &&
                    window.currentMember) {
                    // モーダルが表示されたらスキーマを追加
                    addMemberSchema(window.currentMember);
                }
            });
        });

        observer.observe(modal, { attributes: true });
    }
});