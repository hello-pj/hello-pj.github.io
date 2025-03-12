// グループ別メンバー一覧ページ用のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 変数初期化
    let allMembers = [];
    let groupMembers = [];

    // DOM要素
    const membersContainer = document.getElementById('members-container');
    const resultCount = document.getElementById('result-count');
    const loadingSpinner = document.getElementById('loading-spinner');
    const modal = document.getElementById('member-modal');
    const closeModal = document.querySelector('.close-modal');

    // 現在のページからグループ名を取得
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    const groupId = fileName.replace('.html', '');

    // グループ名マッピング
    const groupNameMapping = {
        'morningmusume': "モーニング娘。'25",
        'angerme': "アンジュルム",
        'juicejuice': "Juice=Juice",
        'tsubakifactory': "つばきファクトリー",
        'beyooooonds': "BEYOOOOONDS",
        'ochanorma': "OCHA NORMA",
        'rosychronicle': "ロージークロニクル",
        'trainees': "ハロプロ研修生"
    };

    // 現在のグループ名を取得
    const currentGroupName = groupNameMapping[groupId] || "ハロー！プロジェクト";

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

    // グループナビゲーションがある場合は、現在のグループにactiveクラスを追加
    const groupLinks = document.querySelectorAll('.group-nav-item');
    if (groupLinks.length > 0) {
        groupLinks.forEach(link => {
            if (link.getAttribute('href').includes(groupId)) {
                link.classList.add('active');
            }
        });
    }

    // メンバーデータの初期化と表示
    async function initializeMembers() {
        allMembers = await fetchMembers();

        if (allMembers.length > 0) {
            // 特定のグループのメンバーだけをフィルタリング
            groupMembers = allMembers.filter(member => member["グループ名"] === currentGroupName);
            updateResultCount();
            displayMembers();
        }
    }

    // メンバーカードの表示
    function displayMembers() {
        // コンテナをクリア
        membersContainer.innerHTML = '';

        if (groupMembers.length === 0) {
            // 検索結果がない場合
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = '条件に一致するメンバーが見つかりませんでした。';
            membersContainer.appendChild(noResults);
            return;
        }

        // 各メンバーのカードを作成
        groupMembers.forEach((member, index) => {
            const card = document.createElement('div');
            card.className = 'member-card fade-in';
            card.style.animationDelay = `${index * 0.05}s`;

            // 画像パスの生成
            const groupPath = convertGroupNameToPath(member["グループ名"]);
            const memberPath = convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"]);
            const imagePath = `../img/members/${groupPath}/${convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"])}.jpg`;

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
        const imagePath = `../img/members/${groupPath}/${convertMemberNameToPath(member["メンバー名"], member["公式プロフィールURL"])}.jpg`;

        // モーダルの各要素を設定
        document.getElementById('modal-image').src = imagePath;
        document.getElementById('modal-image').onerror = function() {
            this.src = '../img/members/default.jpg';
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

    // 検索結果数の更新
    function updateResultCount() {
        resultCount.textContent = `${groupMembers.length}人のメンバーが表示されています`;
    }

    // イベントリスナー設定
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