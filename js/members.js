// メンバー一覧ページ用のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 変数初期化
    let allMembers = [];
    let filteredMembers = [];

    // DOM要素
    const membersContainer = document.getElementById('members-container');
    const groupFilter = document.getElementById('group-filter');
    const bloodFilter = document.getElementById('blood-filter');
    const prefectureFilter = document.getElementById('prefecture-filter');
    const colorFilter = document.getElementById('color-filter');
    const birthMonthFilter = document.getElementById('birth-month-filter');
    const sortOption = document.getElementById('sort-option');
    const resetButton = document.getElementById('reset-button');
    const resultCount = document.getElementById('result-count');
    const loadingSpinner = document.getElementById('loading-spinner');
    const modal = document.getElementById('member-modal');
    const closeModal = document.querySelector('.close-modal');
    const nameSearchInput = document.getElementById('name-search');

    let searchTimeout;
    nameSearchInput.addEventListener('input', function() {
        // 前の検索タイマーをクリア
        clearTimeout(searchTimeout);

        // 300ms後にフィルターを適用（連続入力による負荷を軽減）
        searchTimeout = setTimeout(applyFilters, 300);
    });

    // グループ情報（グループ名とカラー）
    const groupInfo = {
        "モーニング娘。'25": "#E80112",
        "アンジュルム": "#0091D2",
        "Juice=Juice": "#611A85",
        "つばきファクトリー": "#F29EC2",
        "BEYOOOOONDS": "#249849",
        "OCHA NORMA": "#F39800",
        "ロージークロニクル": "#FFD629",
        "ハロプロ研修生": "#33D6AD"
    };

    // メンバーカラーグループ化（フィルタリング用）
    const colorGroups = {
        "赤系": [
            "ピュアレッド", "ライトレッド", "イタリアンレッド", "赤",
            "ピンク", "ホットピンク", "ライトピンク", "チェリーピンク",
            "コーラル", "ワインレッド", "ローズ", "コーラルピンク", "ピーチ"
        ],
        "青系": [
            "シーブルー", "アクアブルー", "ロイヤルブルー", "ライトブルー",
            "ミディアムブルー", "青", "水色", "ブルー", "ネイビー", "スカイブルー", "ターコイズ"
        ],
        "緑系": [
            "黄緑", "ブライトグリーン", "ミントグリーン", "グリーン",
            "エメラルドグリーン", "ライトグリーン", "ミント", "エメラルド", "セージグリーン"
        ],
        "黄系": [
            "デイジー", "オレンジ", "イエロー", "ゴールドイエロー", "マスタード",
            "黄", "ゴールド"
        ],
        "紫系": [
            "ラベンダー", "パープル", "ライトパープル", "ピーチパープル",
            "プラムパープル"
        ],
        "白系": [
            "白", "ホワイト", "黒", "シルバー", "グレー", "ベージュ",
            "ブラウン", "アイボリー", "ミルクティー"
        ]
    }

    // 検索用のユーティリティ関数を追加
    // ひらがな・カタカナ・漢字の相互変換と検索用ユーティリティ
    const kanaConversionMap = {
        'あ': 'ア',
        'い': 'イ',
        'う': 'ウ',
        'え': 'エ',
        'お': 'オ',
        'か': 'カ',
        'き': 'キ',
        'く': 'ク',
        'け': 'ケ',
        'こ': 'コ',
        'さ': 'サ',
        'し': 'シ',
        'す': 'ス',
        'せ': 'セ',
        'そ': 'ソ',
        'た': 'タ',
        'ち': 'チ',
        'つ': 'ツ',
        'て': 'テ',
        'と': 'ト',
        'な': 'ナ',
        'に': 'ニ',
        'ぬ': 'ヌ',
        'ね': 'ネ',
        'の': 'ノ',
        'は': 'ハ',
        'ひ': 'ヒ',
        'ふ': 'フ',
        'へ': 'ヘ',
        'ほ': 'ホ',
        'ま': 'マ',
        'み': 'ミ',
        'む': 'ム',
        'め': 'メ',
        'も': 'モ',
        'や': 'ヤ',
        'ゆ': 'ユ',
        'よ': 'ヨ',
        'ら': 'ラ',
        'り': 'リ',
        'る': 'ル',
        'れ': 'レ',
        'ろ': 'ロ',
        'わ': 'ワ',
        'を': 'ヲ',
        'ん': 'ン'
    };

    // ひらがなをカタカナに変換
    function hiraganaToKatakana(str) {
        return str.split('').map(char => kanaConversionMap[char] || char).join('');
    }

    // 検索文字列が対象の文字列に含まれるかをチェック
    function matchSearch(searchStr, targetStr) {
        if (!searchStr) return true;

        // 全角半角の統一と大文字・小文字の区別をなくす
        const normalizedSearch = searchStr
            .toLowerCase()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .trim();

        const normalizedTarget = targetStr
            .toLowerCase()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .trim();

        // 漢字名、よみがな（カタカナ）、よみがな（ひらがな）をそれぞれ検索
        const searchKatakana = hiraganaToKatakana(normalizedSearch);

        return normalizedTarget.includes(normalizedSearch) ||
            normalizedTarget.includes(searchKatakana);
    }

    // APIからメンバーデータを取得
    async function fetchMembers() {
        loadingSpinner.style.display = 'block';
        try {
            // 更新済みのAPIエンドポイントURL
            const response = await fetch('https://script.google.com/macros/s/AKfycbyBTDhXpSIImgfQicPkXJYvrQbyDAFIqEYzWbn_58Q5AjUs88WoJfrhk-45Yz7msG-R/exec');
            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('エラー:', error);
            resultCount.textContent = 'データの読み込みに失敗しました。再読み込みしてください。';
            return [];
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // メンバーデータの初期化と表示
    async function initializeMembers() {
        allMembers = await fetchMembers();

        if (allMembers.length > 0) {
            // フィルター項目の設定
            setupFilterOptions();

            // メンバーを表示（デフォルトの順序を保持）
            filteredMembers = [...allMembers];
            updateResultCount();
            displayMembers();
        }
    }

    // フィルターオプションの設定
    function setupFilterOptions() {
        // グループフィルターの設定
        const groups = [...new Set(allMembers.map(member => member["グループ名"]))];
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupFilter.appendChild(option);
        });

        // 都道府県フィルターの設定
        const prefectures = [...new Set(allMembers.map(member => {
            // 全角スペースや改行を除去し、最初の部分を取得
            const location = String(member["出身地"] || "").trim();
            const prefecture = location.split(/[\s　]/)[0]
                .replace('県', '')
                .replace('都', '')
                .replace('府', '');
            return prefecture;
        }))].filter(Boolean);

        // 北から南へ並べ替える都道府県リスト
        const prefectureOrder = [
            '北海道', '青森', '秋田', '岩手', '宮城', '山形', '福島',
            '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '山梨',
            '新潟', '長野', '富山', '石川', '福井', '岐阜', '愛知', '静岡',
            '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
            '鳥取', '島根', '岡山', '広島', '山口',
            '徳島', '香川', '愛媛', '高知',
            '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'
        ];

        // 地域内での順序を保持しつつ、フィルターに存在する都道府県のみをソート
        const sortedPrefectures = prefectureOrder.filter(pref => prefectures.includes(pref));

        sortedPrefectures.forEach(prefecture => {
            const option = document.createElement('option');
            option.value = prefecture;
            option.textContent = prefecture;
            prefectureFilter.appendChild(option);
        });

        // メンバーカラーフィルターの設定
        const colorNames = [...new Set(allMembers.map(member => member["メンバーカラー名"]))].filter(Boolean).sort();

        // 色のグループを追加
        Object.keys(colorGroups).forEach(groupName => {
            const option = document.createElement('option');
            option.value = `group_${groupName}`;
            option.textContent = `${groupName}の色`;
            colorFilter.appendChild(option);
        });

        // 個別の色を追加
        colorNames.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            colorFilter.appendChild(option);
        });

        // ソートオプションを更新（年齢順のラベルを変更）
        const sortOption = document.getElementById('sort-option');
        sortOption.innerHTML = `
            <option value="default_asc">デフォルト（昇順）</option>
            <option value="default_desc">デフォルト（降順）</option>
            <option value="name_asc">名前（昇順）</option>
            <option value="name_desc">名前（降順）</option>
            <option value="birthday_asc">年齢順（昇順）</option>
            <option value="birthday_desc">年齢順（降順）</option>
        `;
    }

    // メンバーのソート
    function sortMembers() {
        const sortType = sortOption.value;

        switch (sortType) {
            case 'default_asc':
                // スプレッドシートの元の順序を維持
                filteredMembers = [...allMembers].filter(member => filteredMembers.includes(member));
                break;
            case 'default_desc':
                // スプレッドシートの元の順序を逆にする
                filteredMembers = [...allMembers].reverse().filter(member => filteredMembers.includes(member));
                break;
            case 'name_asc':
                filteredMembers.sort((a, b) => {
                    const readingA = a["メンバー名（読み）"] || a["メンバー名"];
                    const readingB = b["メンバー名（読み）"] || b["メンバー名"];
                    return readingA.localeCompare(readingB, 'ja');
                });
                break;
            case 'name_desc':
                filteredMembers.sort((a, b) => {
                    const readingA = a["メンバー名（読み）"] || a["メンバー名"];
                    const readingB = b["メンバー名（読み）"] || b["メンバー名"];
                    return readingB.localeCompare(readingA, 'ja');
                });
                break;
            case 'birthday_asc':
                filteredMembers.sort((a, b) => {
                    const aDate = a["誕生日"] ? new Date(a["誕生日"]) : new Date(0);
                    const bDate = b["誕生日"] ? new Date(b["誕生日"]) : new Date(0);
                    return aDate - bDate;
                });
                break;
            case 'birthday_desc':
                filteredMembers.sort((a, b) => {
                    const aDate = a["誕生日"] ? new Date(a["誕生日"]) : new Date(0);
                    const bDate = b["誕生日"] ? new Date(b["誕生日"]) : new Date(0);
                    return bDate - aDate;
                });
                break;
        }
    }

    // メンバーカードの表示
    function displayMembers() {
        // コンテナをクリア
        membersContainer.innerHTML = '';

        if (filteredMembers.length === 0) {
            // 検索結果がない場合
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = '条件に一致するメンバーが見つかりませんでした。';
            membersContainer.appendChild(noResults);
            return;
        }

        // 各メンバーのカードを作成
        filteredMembers.forEach((member, index) => {
            const card = document.createElement('div');
            card.className = 'member-card fade-in';
            card.style.animationDelay = `${index * 0.05}s`;

            // 画像パスの生成（例: morningmusume/erina_ikuta.jpg）
            // グループ名を英語表記に変換
            const groupPath = convertGroupNameToPath(member["グループ名"]);
            const memberPath = convertMemberNameToPath(member["メンバー名"]);
            const imagePath = `img/members/${groupPath}/${convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"])}.jpg`;

            // カードのHTMLを設定
            card.innerHTML = `
            <div class="card-img-container">
                <img src="${imagePath}" alt="${member["メンバー名"]}" onerror="this.src='img/members/default.jpg'; console.log('画像読み込みエラー');">
                <div class="color-tag" style="background-color: ${member["メンバーカラー"] || '#999'}"></div>
                <div class="group-badge" style="background-color: ${groupInfo[member["グループ名"]] || '#999'}">${member["グループ名"]}</div>
            </div>
            <div class="card-content">
                <h3 class="member-name">${member["メンバー名"]}</h3>
                <p class="member-reading">${member["メンバー名（読み）"] || ''}</p>
                <div class="member-basic-info">
                    <span class="member-birthday">${formatBirthday(member["誕生日"])}</span>
                    <span class="member-blood">${member["血液型"] || ''}</span>
                </div>
            </div>
        `;

            // カードクリック時の詳細表示
            card.addEventListener('click', () => {
                showMemberDetails(member);
            });

            membersContainer.appendChild(card);
        });
    }

    // グループ名をパス用の英語表記に変換
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

    // メンバー名をパス用の英語表記に変換
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

    // 誕生日のフォーマット（YYYY/MM/DD形式に変更）
    function formatBirthday(birthday) {
        if (!birthday) return '';

        try {
            // ISO形式の誕生日を日付オブジェクトに変換
            const date = new Date(birthday);
            if (isNaN(date.getTime())) return '';

            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 月は0から始まるので+1
            const day = date.getDate();

            return `${year}/${month}/${day}`; // 西暦/月/日の形式に変更
        } catch (e) {
            console.error('誕生日のフォーマットエラー:', e);
            return '';
        }
    }

    // メンバー詳細モーダル表示
    function showMemberDetails(member) {
        // 画像パスの設定
        const groupPath = convertGroupNameToPath(member["グループ名"]);
        const memberPath = convertMemberNameToPath(member["メンバー名"]);
        const imagePath = `img/members/${groupPath}/${convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"])}.jpg`;

        // モーダルの各要素を設定
        document.getElementById('modal-image').src = imagePath;
        document.getElementById('modal-image').onerror = function() {
            this.src = 'img/members/default.jpg';
        };
        document.getElementById('modal-color-tag').style.backgroundColor = member["メンバーカラー"] || '#999';
        document.getElementById('modal-name').textContent = member["メンバー名"] || '';
        document.getElementById('modal-name-reading').textContent = member["メンバー名（読み）"] || '';

        const groupElement = document.getElementById('modal-group');
        groupElement.textContent = member["グループ名"] || '';
        groupElement.style.backgroundColor = groupInfo[member["グループ名"]] || '#999';

        // 誕生日を整形して表示
        let birthdayText = '';
        if (member["誕生日"]) {
            try {
                const date = new Date(member["誕生日"]);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    birthdayText = `${year}年${month}月${day}日`;
                }
            } catch (e) {
                console.error('誕生日のフォーマットエラー:', e);
            }
        }

        document.getElementById('modal-birthday').textContent = birthdayText || '不明';
        document.getElementById('modal-blood').textContent = member["血液型"] || '不明';
        document.getElementById('modal-prefecture').textContent = member["出身地"] || '不明';
        document.getElementById('modal-color-name').textContent = member["メンバーカラー名"] || '不明';

        // 外部リンク設定
        const blogLink = document.getElementById('modal-blog');
        if (member["ブログURL"]) {
            blogLink.href = member["ブログURL"];
            blogLink.style.display = '';
        } else {
            blogLink.style.display = 'none';
        }

        const instaLink = document.getElementById('modal-instagram');
        if (member["インスタグラムURL"]) {
            instaLink.href = member["インスタグラムURL"];
            instaLink.style.display = '';
        } else {
            instaLink.style.display = 'none';
        }

        const profileLink = document.getElementById('modal-profile');
        if (member["公式プロフィールURL"]) {
            profileLink.href = member["公式プロフィールURL"];
            profileLink.style.display = '';
        } else {
            profileLink.style.display = 'none';
        }

        window.currentMember = member; // 現在表示中のメンバー情報をグローバル変数に保存
        if (window.addMemberSchema) {
            window.addMemberSchema(member);
        }

        // モーダルを表示
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 背景スクロール防止

    }

    // モーダルを閉じる
    function closeModalWindow() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // スクロール許可
    }

    // フィルタリング適用
    function applyFilters() {
        const group = groupFilter.value;
        const blood = bloodFilter.value;
        const prefecture = prefectureFilter.value;
        const color = colorFilter.value;
        const birthMonth = birthMonthFilter.value;
        const searchQuery = document.getElementById('name-search').value;

        filteredMembers = allMembers.filter(member => {
            // 既存のフィルター条件
            // グループフィルター
            if (group !== 'all' && member["グループ名"] !== group) {
                return false;
            }

            // 血液型フィルター
            if (blood !== 'all') {
                const memberBloodType = member["血液型"].replace('型', '');
                if (memberBloodType !== blood) {
                    return false;
                }
            }

            // 出身地フィルター
            if (prefecture !== 'all' && !String(member["出身地"] || "").includes(prefecture)) {
                return false;
            }

            // メンバーカラーフィルター
            if (color !== 'all') {
                if (color.startsWith('group_')) {
                    const colorGroupName = color.replace('group_', '');
                    const colorList = colorGroups[colorGroupName] || [];

                    if (!colorList.some(c => String(member["メンバーカラー名"] || "").includes(c))) {
                        return false;
                    }
                } else {
                    if (String(member["メンバーカラー名"] || "") !== color) {
                        return false;
                    }
                }
            }

            // 誕生月フィルター
            if (birthMonth !== 'all') {
                try {
                    const date = new Date(member["誕生日"]);
                    if (isNaN(date.getTime()) || date.getMonth() + 1 !== parseInt(birthMonth)) {
                        return false;
                    }
                } catch (e) {
                    return false;
                }
            }

            // 名前検索フィルター（新規追加）
            if (searchQuery) {
                const nameMatches =
                    matchSearch(searchQuery, member["メンバー名"]) ||
                    matchSearch(searchQuery, member["メンバー名（読み）"]);

                if (!nameMatches) {
                    return false;
                }
            }

            return true;
        });

        // ソート適用
        sortMembers();

        // 表示更新
        displayMembers();
        updateResultCount();
    }
    // 検索結果数の更新
    function updateResultCount() {
        resultCount.textContent = `${filteredMembers.length}人のメンバーが表示されています`;
    }

    // フィルターリセット
    function resetFilters() {
        groupFilter.value = 'all';
        bloodFilter.value = 'all';
        prefectureFilter.value = 'all';
        colorFilter.value = 'all';
        birthMonthFilter.value = 'all';
        sortOption.value = 'default_asc'; // デフォルトソートを初期値に

        filteredMembers = [...allMembers];
        sortMembers();
        displayMembers();
        updateResultCount();
    }

    // イベントリスナー設定
    groupFilter.addEventListener('change', applyFilters);
    bloodFilter.addEventListener('change', applyFilters);
    prefectureFilter.addEventListener('change', applyFilters);
    colorFilter.addEventListener('change', applyFilters);
    birthMonthFilter.addEventListener('change', applyFilters);
    sortOption.addEventListener('change', () => {
        sortMembers();
        displayMembers();
    });
    resetButton.addEventListener('click', resetFilters);

    // モーダル閉じるボタン
    closeModal.addEventListener('click', closeModalWindow);

    // モーダル背景クリックで閉じる
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalWindow();
        }
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModalWindow();
        }
    });

    // 初期化
    initializeMembers();
});