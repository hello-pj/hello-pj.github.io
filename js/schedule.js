// スケジュール一覧ページのスクリプト
document.addEventListener('DOMContentLoaded', function() {
    // グループ情報の定義
    const groups = [
        { id: 'morning', name: "モーニング娘。'25", color: "#E80112" },
        { id: 'angerme', name: "アンジュルム", color: "#0091D2" },
        { id: 'juice', name: "Juice=Juice", color: "#611A85" },
        { id: 'tsubaki', name: "つばきファクトリー", color: "#F29EC2" },
        { id: 'beyooooonds', name: "BEYOOOOONDS", color: "#249849" },
        { id: 'ocha', name: "OCHA NORMA", color: "#F39800" },
        { id: 'rosy', name: "ロージークロニクル", color: "#FFD629" },
        { id: 'trainee', name: "ハロプロ研修生", color: "#33D6AD" }
    ];

    let allEvents = []; // すべてのイベントデータを保持
    let currentMonth = new Date().getMonth(); // 現在表示中の月（0-11）
    let currentYear = new Date().getFullYear(); // 現在表示中の年

    // 曜日の表示名
    const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

    // ロード時の初期化
    initializeSchedule();

    // 初期化処理
    function initializeSchedule() {
        // 1. カレンダーからイベントデータを取得
        fetchEventData()
            .then(events => {
                allEvents = events;

                // 2. 月選択オプションを設定
                setupMonthSelector();

                // 3. 前月・次月ボタンのイベントリスナーを設定
                setupNavigationButtons();

                // 4. 現在月のスケジュールを表示
                displayMonthSchedule(currentYear, currentMonth);
            })
            .catch(error => {
                console.error('イベントデータの取得に失敗しました:', error);
                document.getElementById('loading-message').textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
            });
    }

    // APIからイベントデータを取得
    async function fetchEventData() {
        // calendar-data.jsの関数を使用
        if (typeof CalendarData !== 'undefined' && typeof CalendarData.fetchEventData === 'function') {
            return await CalendarData.fetchEventData();
        } else {
            // CalendarDataがない場合は直接APIを呼び出す
            const response = await fetch('https://script.google.com/macros/s/AKfycbxXh9UQzHzgSAxUg8sxAINgapf-XZl-2mIKjbzR0JGqzscrIjBRaG72wgE2MmnQolsKpg/exec');
            if (!response.ok) {
                throw new Error('APIからのデータ取得に失敗しました');
            }
            return await response.json();
        }
    }

    // 月選択オプションを設定
    function setupMonthSelector() {
        const monthSelector = document.getElementById('month-selector');
        monthSelector.innerHTML = ''; // クリア

        // 現在月から前後3ヶ月ずつ（計7ヶ月）を選択肢に追加
        for (let i = -3; i <= 3; i++) {
            let date = new Date(currentYear, currentMonth + i, 1);
            let year = date.getFullYear();
            let month = date.getMonth();

            const option = document.createElement('option');
            option.value = `${year}-${month}`;
            option.textContent = `${year}年${month + 1}月`;
            option.selected = i === 0; // 現在月を選択状態にする
            monthSelector.appendChild(option);
        }

        // 変更イベントのリスナーを設定
        monthSelector.addEventListener('change', function() {
            const [selectedYear, selectedMonth] = this.value.split('-').map(Number);
            currentYear = selectedYear;
            currentMonth = selectedMonth;
            displayMonthSchedule(currentYear, currentMonth);
        });
    }

    // 前月・次月ボタンのイベントリスナーを設定
    function setupNavigationButtons() {
        // 前月ボタン
        document.getElementById('prev-month').addEventListener('click', function() {
            let date = new Date(currentYear, currentMonth - 1, 1);
            currentYear = date.getFullYear();
            currentMonth = date.getMonth();

            // 月選択オプションを更新
            setupMonthSelector();
            // スケジュールを更新
            displayMonthSchedule(currentYear, currentMonth);
        });

        // 次月ボタン
        document.getElementById('next-month').addEventListener('click', function() {
            let date = new Date(currentYear, currentMonth + 1, 1);
            currentYear = date.getFullYear();
            currentMonth = date.getMonth();

            // 月選択オプションを更新
            setupMonthSelector();
            // スケジュールを更新
            displayMonthSchedule(currentYear, currentMonth);
        });
    }

    // 指定月のスケジュールを表示
    function displayMonthSchedule(year, month) {
        // ローディングメッセージを表示
        document.getElementById('loading-message').style.display = 'block';

        // 表示対象の月のイベントだけをフィルタリング
        const filteredEvents = filterEventsByMonth(allEvents, year, month);

        // イベントを日付ごとにグループ化
        const eventsByDate = groupEventsByDate(filteredEvents);

        // スケジュールテーブルを生成
        generateScheduleTable(eventsByDate, year, month);

        // ローディングメッセージを非表示
        document.getElementById('loading-message').style.display = 'none';
    }

    // イベントを指定月でフィルタリング
    function filterEventsByMonth(events, year, month) {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
    }

    // イベントを日付ごとにグループ化
    function groupEventsByDate(events) {
        const eventsByDate = {};

        events.forEach(event => {
            // イベントの日付を取得
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD形式

            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = [];
            }

            eventsByDate[dateKey].push(event);
        });

        return eventsByDate;
    }

    // スケジュールテーブルを生成
    function generateScheduleTable(eventsByDate, year, month) {
        const scheduleTable = document.getElementById('schedule-table');
        scheduleTable.innerHTML = ''; // クリア

        // 日付の昇順でソート
        const sortedDates = Object.keys(eventsByDate).sort();

        if (sortedDates.length === 0) {
            // イベントがない場合はメッセージを表示
            document.getElementById('loading-message').textContent = 'この月のイベントはありません。';
            document.getElementById('loading-message').style.display = 'block';
            return;
        }

        // ヘッダー行を作成
        const headerRow = document.createElement('tr');

        // 日付列ヘッダー
        const dateHeader = document.createElement('th');
        dateHeader.className = 'date-column';
        dateHeader.textContent = '日付';
        headerRow.appendChild(dateHeader);

        // グループ列ヘッダー
        groups.forEach(group => {
            const th = document.createElement('th');
            th.className = 'header-cell';
            th.style.borderTop = `3px solid ${group.color}`;
            th.textContent = group.name;
            headerRow.appendChild(th);
        });

        scheduleTable.appendChild(headerRow);

        // 各日付の行を生成
        sortedDates.forEach(dateStr => {
            const eventsForDate = eventsByDate[dateStr];
            const row = document.createElement('tr');

            // 日付セル
            const date = new Date(dateStr);
            const dateCell = document.createElement('td');
            dateCell.className = 'date-cell';

            // 曜日によるクラス追加
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) {
                dateCell.classList.add('sunday');
            } else if (dayOfWeek === 6) {
                dateCell.classList.add('saturday');
            }

            dateCell.innerHTML = `${date.getDate()}<br><small>(${weekdayNames[dayOfWeek]})</small>`;
            row.appendChild(dateCell);

            // グループごとのセルを作成
            groups.forEach(group => {
                const groupCell = document.createElement('td');

                // 曜日によるクラス追加
                if (dayOfWeek === 0) {
                    groupCell.classList.add('sunday');
                } else if (dayOfWeek === 6) {
                    groupCell.classList.add('saturday');
                }

                // グループに対応するイベントを取得
                const groupEvents = eventsForDate.filter(event => event.group === group.name);

                if (groupEvents.length > 0) {
                    // イベント情報をセルに追加
                    groupEvents.forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = `event-cell group-${group.id}`;

                        // 場所と開演時間を表示
                        let eventContent = '';

                        if (event.location) {
                            eventContent += `<span class="event-venue">${event.location}</span>`;
                        }

                        // 開演時間の表示
                        if (event.allDay) {
                            // 終日イベントの場合はイベント名を表示
                            eventContent += event.title;
                        } else {
                            // 開演時間を表示
                            const startTime = getEventTime(event.start);
                            const endTime = event.end ? getEventTime(event.end) : '';

                            if (startTime) {
                                eventContent += `<span class="event-time">${startTime}${endTime ? '/' + endTime : ''}</span>`;
                            } else {
                                // 開演時間がない場合はイベント名を表示
                                eventContent += event.title;
                            }
                        }

                        eventDiv.innerHTML = eventContent;
                        groupCell.appendChild(eventDiv);
                    });
                }

                row.appendChild(groupCell);
            });

            scheduleTable.appendChild(row);
        });
    }

    // イベントの開始時間を取得する関数（HH:MM形式で返す）
    function getEventTime(dateTimeStr) {
        // 日時文字列からDateオブジェクトを作成
        const date = new Date(dateTimeStr);

        // 不正な日付の場合は空文字を返す
        if (isNaN(date.getTime())) {
            return '';
        }

        // 時刻部分を HH:MM 形式で返す
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    }
});