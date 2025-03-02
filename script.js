document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var eventTitle = document.getElementById('event-title');
    var eventDate = document.getElementById('event-date');
    var eventLocation = document.getElementById('event-location');
    var eventDescription = document.getElementById('event-description');
    var eventGroup = document.getElementById('event-group');
    var eventImage = document.getElementById('event-image');
    var groupFiltersContainer = document.getElementById('group-filters');
    var eventDetails = document.getElementById('event-details');
    var overlay = document.getElementById('overlay');
    var calendar; // カレンダーインスタンスをグローバルに定義
    var isMobile = window.innerWidth <= 768; // 現在のビューがモバイルかどうか
    var currentEvents = []; // イベントデータを保持する変数

    // イベントリスト表示用の要素を取得
    var eventListContainer = document.getElementById('event-list-container');

    var groupColors = {
        "HELLO! PROJECT": "#035F9F",
        "モーニング娘。'25": "#E80112",
        "アンジュルム": "#0091D2",
        "Juice=Juice": "#611A85",
        "つばきファクトリー": "#F29EC2",
        "BEYOOOOONDS": "#249849",
        "OCHA NORMA": "#F39800",
        "ロージークロニクル": "#FFD629",
        "ハロプロ研修生": "#33D6AD"
    };

    var groupImages = {
        "HELLO! PROJECT": "img/hello_project_image.jpg",
        "モーニング娘。'25": "img/morning_musume_image.jpg",
        "アンジュルム": "img/angerme_image.jpg",
        "Juice=Juice": "img/juice_juice_image.jpg",
        "つばきファクトリー": "img/tsubaki_factory_image.jpg",
        "BEYOOOOONDS": "img/beyooooonds_image.jpg",
        "OCHA NORMA": "img/ocha_norma_image.jpg",
        "ロージークロニクル": "img/rouge_chronicle_image.jpg",
        "ハロプロ研修生": "img/hello_project_trainees_image.jpg"
    };

    var activeGroups = new Set(Object.keys(groupColors));

    // スワイプ関連の変数
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 50; // スワイプと認識する最小距離

    function fetchEventData() {
        return fetch('https://script.google.com/macros/s/AKfycbxXh9UQzHzgSAxUg8sxAINgapf-XZl-2mIKjbzR0JGqzscrIjBRaG72wgE2MmnQolsKpg/exec')
            .then(function(response) {
                return response.json();
            })
            .then(function(events) {
                return events.map(function(event) {
                    // 日付をUTCからJST(UTC+9)に変換
                    var utcDate = new Date(event['Start Date']);
                    var jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
                    event['Start Date'] = jstDate.toISOString().split('T')[0];

                    // 終了日があればUTCからJSTに変換
                    if (event['End Date']) {
                        var utcEndDate = new Date(event['End Date']);
                        var jstEndDate = new Date(utcEndDate.getTime() + 9 * 60 * 60 * 1000);
                        event['End Date'] = jstEndDate.toISOString().split('T')[0];
                    }

                    // All Day Event の処理
                    if (event['All Day Event'] === true || event['All Day Event'] === 'TRUE') {
                        return {
                            id: event.Id,
                            title: event.Subject,
                            start: event['Start Date'], // 終日イベントは時間なしの日付だけを指定
                            end: event['End Date'] ? event['End Date'] : null, // 終了日があれば設定
                            allDay: true,
                            location: event.Location,
                            description: event.Description,
                            group: event.Group,
                            color: groupColors[event.Group] || '#000000'
                        };
                    } else {
                        // 時間指定のあるイベント
                        if (event['Start Time']) {
                            event['Start Time'] = event['Start Time'].split('T')[1];
                        } else {
                            event['Start Time'] = '00:00:00';
                        }

                        return {
                            id: event.Id,
                            title: event.Subject,
                            start: event['Start Date'] + "T" + event['Start Time'],
                            end: event['End Date'] ? (event['End Date'] + "T" + (event['End Time'] ? event['End Time'].split('T')[1] : '23:59:59')) : null,
                            allDay: false,
                            location: event.Location,
                            description: event.Description,
                            group: event.Group,
                            color: groupColors[event.Group] || '#000000'
                        };
                    }
                });
            });
    }

    function updateCalendarEvents(calendar, events) {
        calendar.removeAllEvents();
        var filteredEvents = events.filter(function(event) {
            return activeGroups.has(event.group);
        });
        filteredEvents.forEach(function(event) {
            calendar.addEvent(event);
        });
    }

    // 全イベントにモバイルスタイルを適用または解除する関数
    function updateAllEventStyles() {
        var newIsMobile = window.innerWidth <= 768;

        // モバイル状態が変わった場合のみ処理
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;

            // 現在の表示を保存
            var currentDate = calendar ? calendar.getDate() : new Date();
            var currentView = calendar && calendar.view ? calendar.view.type : 'dayGridMonth';
            var scrollPosition = window.scrollY;

            // カレンダーを破棄して再作成
            if (calendar) {
                calendar.destroy();
            }

            // 新しいカレンダーを作成
            initializeCalendar(currentEvents);

            // 保存した状態を復元
            calendar.gotoDate(currentDate);
            calendar.changeView(currentView);

            // フィルターを適用
            updateCalendarEvents(calendar, currentEvents);

            // スクロール位置を復元
            window.scrollTo(0, scrollPosition);
        }
    }

    // 曜日の表示名（日本語）
    var weekdayNames = {
        0: '日',
        1: '月',
        2: '火',
        3: '水',
        4: '木',
        5: '金',
        6: '土'
    };

    // 同じ日付のイベントを取得する関数
    function getEventsOnSameDay(eventDate, events) {
        // 日付を YYYY-MM-DD 形式の文字列に変換（ローカル時間ベース）
        var year = eventDate.getFullYear();
        var month = String(eventDate.getMonth() + 1).padStart(2, '0');
        var day = String(eventDate.getDate()).padStart(2, '0');
        var dateStr = year + '-' + month + '-' + day;

        // 同じ日付のイベントをフィルタリングして返す
        return events
            .filter(function(event) {
                var eventDateStr = '';

                if (typeof event.start === 'string') {
                    // 文字列の場合は日付部分を抽出
                    eventDateStr = event.start.split('T')[0];
                } else if (event.start instanceof Date) {
                    // Date オブジェクトの場合
                    var eventDateObj = event.start;
                    var eventYear = eventDateObj.getFullYear();
                    var eventMonth = String(eventDateObj.getMonth() + 1).padStart(2, '0');
                    var eventDay = String(eventDateObj.getDate()).padStart(2, '0');
                    eventDateStr = eventYear + '-' + eventMonth + '-' + eventDay;
                } else if (typeof event.start === 'object' && event.start && typeof event.start.toDate === 'function') {
                    // FullCalendarのDateオブジェクト
                    var fcDate = event.start.toDate();
                    var fcYear = fcDate.getFullYear();
                    var fcMonth = String(fcDate.getMonth() + 1).padStart(2, '0');
                    var fcDay = String(fcDate.getDate()).padStart(2, '0');
                    eventDateStr = fcYear + '-' + fcMonth + '-' + fcDay;
                } else {
                    // その他の場合は日付として処理できない
                    return false;
                }

                // グループフィルターのチェック
                var group = event.group;
                if (event.extendedProps && event.extendedProps.group) {
                    group = event.extendedProps.group;
                }

                return eventDateStr === dateStr && activeGroups.has(group);
            })
            .sort(function(a, b) {
                // 終日イベントを先に表示
                if (a.allDay && !b.allDay) return -1;
                if (!a.allDay && b.allDay) return 1;

                // 時間取得と比較
                var getAdjustedTime = function(event) {
                    if (typeof event.start === 'string' && event.start.indexOf('T') > -1) {
                        // ISO文字列からUTC時間を取得してJST（UTC+9）に調整
                        var timeParts = event.start.split('T')[1].split(':');
                        var hours = parseInt(timeParts[0], 10);
                        var minutes = parseInt(timeParts[1], 10);

                        // UTCをJSTに変換（+9時間）
                        hours = (hours + 9) % 24;

                        return String(hours).padStart(2, '0') + ':' +
                            String(minutes).padStart(2, '0');
                    } else if (event.start instanceof Date) {
                        // すでにローカル時間なのでそのまま使用
                        return String(event.start.getHours()).padStart(2, '0') + ':' +
                            String(event.start.getMinutes()).padStart(2, '0');
                    } else {
                        return '00:00'; // デフォルト
                    }
                };

                var timeA = getAdjustedTime(a);
                var timeB = getAdjustedTime(b);

                return timeA.localeCompare(timeB);
            });
    }

    // イベントリストを表示する関数
    function showEventList(date, events) {
        // イベントリストの日付を設定
        var formattedDate = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 (' + weekdayNames[date.getDay()] + ')';
        document.getElementById('event-list-date').textContent = formattedDate + 'のイベント';

        // イベントリストをクリア
        var eventListEl = document.getElementById('event-list');
        eventListEl.innerHTML = '';

        // イベントリストを作成
        if (events.length === 0) {
            var noEventEl = document.createElement('div');
            noEventEl.className = 'no-events';
            noEventEl.textContent = 'この日のイベントはありません';
            eventListEl.appendChild(noEventEl);
        } else {
            events.forEach(function(event) {
                var eventItem = document.createElement('div');
                eventItem.className = 'event-list-item';

                // 時間表示の処理
                var formattedTime;
                if (event.allDay) {
                    formattedTime = '終日';
                } else {
                    // 時間指定イベントの場合
                    var hours = '00';
                    var minutes = '00';

                    if (typeof event.start === 'string' && event.start.indexOf('T') > -1) {
                        // ISO文字列からUTC時間を取得し、JST（UTC+9）に調整
                        var timeParts = event.start.split('T')[1].split(':');
                        hours = parseInt(timeParts[0], 10);
                        minutes = timeParts[1];

                        // UTCをJSTに変換（+9時間）
                        hours = (hours + 9) % 24;
                        hours = String(hours).padStart(2, '0');
                    } else if (event.start instanceof Date) {
                        // Dateオブジェクトからはローカル時間を取得（すでにブラウザのタイムゾーンに調整済み）
                        hours = String(event.start.getHours()).padStart(2, '0');
                        minutes = String(event.start.getMinutes()).padStart(2, '0');
                    } else if (typeof event.start === 'object' && event.start && typeof event.start.toDate === 'function') {
                        // FullCalendarのDateオブジェクト
                        var date = event.start.toDate();
                        hours = String(date.getHours()).padStart(2, '0');
                        minutes = String(date.getMinutes()).padStart(2, '0');
                    }

                    formattedTime = hours + ':' + minutes;
                }

                // グループ情報の取得
                var groupValue = event.group;
                if (event.extendedProps && event.extendedProps.group) {
                    groupValue = event.extendedProps.group;
                }

                eventItem.innerHTML =
                    '<div class="event-list-time">' + formattedTime + '</div>' +
                    '<div class="event-list-content">' +
                    '<div class="event-list-title">' + event.title + '</div>' +
                    '<div class="event-list-group" style="color: ' + groupColors[groupValue] + '">' + groupValue + '</div>' +
                    '</div>';

                // クリックイベントを追加 - ここでは正確な時間を渡す
                eventItem.addEventListener('click', function() {
                    showEventDetails(event, formattedTime + ' ' + event.title);
                    eventListContainer.classList.remove('show');
                });

                eventListEl.appendChild(eventItem);
            });
        }

        // イベントリストコンテナを表示
        eventListContainer.classList.add('show');

        // オーバーレイを必ず表示
        overlay.style.display = 'block';
    }

    // イベント詳細を表示する関数
    function showEventDetails(event, displayText) {
        eventTitle.textContent = event.title;

        // 日付と時間の処理
        var displayDate = '';

        if (event.allDay) {
            // 終日イベントの処理
            var startStr = '';

            if (typeof event.start === 'string') {
                startStr = event.start.split('T')[0];
            } else if (event.start instanceof Date) {
                var date = event.start;
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, '0');
                var day = String(date.getDate()).padStart(2, '0');
                startStr = year + '-' + month + '-' + day;
            }

            if (event.end) {
                // 終了日がある場合
                var endStr = '';
                if (typeof event.end === 'string') {
                    endStr = event.end.split('T')[0];
                } else if (event.end instanceof Date) {
                    var endDate = event.end;
                    var endYear = endDate.getFullYear();
                    var endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                    var endDay = String(endDate.getDate()).padStart(2, '0');
                    endStr = endYear + '-' + endMonth + '-' + endDay;
                }

                displayDate = startStr + ' 〜 ' + endStr + ' (終日)';
            } else {
                displayDate = startStr + ' (終日)';
            }
        } else {
            // 時間指定イベントの処理

            // 1. まず日付を取得
            var dateStr = '';
            if (typeof event.start === 'string') {
                dateStr = event.start.split('T')[0];
            } else if (event.start instanceof Date) {
                var date = event.start;
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, '0');
                var day = String(date.getDate()).padStart(2, '0');
                dateStr = year + '-' + month + '-' + day;
            }

            // 2. 表示テキストから時間を抽出
            var timeStr = '';

            // 表示テキストからの時間抽出を試みる
            if (displayText) {
                // 「HH:MM イベントタイトル」または「終日 イベントタイトル」の形式から時間部分を抽出
                var timeMatch = displayText.match(/^(\d{1,2}:\d{2})/);
                if (timeMatch && timeMatch[1]) {
                    timeStr = timeMatch[1];
                }
            }

            // 表示テキストから時間が取得できなかった場合のフォールバック
            if (!timeStr) {
                if (typeof event.start === 'string' && event.start.indexOf('T') > -1) {
                    // ISO文字列からUTC時間を取得してJST（UTC+9）に調整
                    var timeParts = event.start.split('T')[1].split(':');
                    var hours = parseInt(timeParts[0], 10);
                    var minutes = timeParts[1];

                    // UTCをJSTに変換（+9時間）
                    hours = (hours + 9) % 24;
                    timeStr = String(hours).padStart(2, '0') + ':' + minutes;
                } else if (event.start instanceof Date) {
                    var hours = String(event.start.getHours()).padStart(2, '0');
                    var minutes = String(event.start.getMinutes()).padStart(2, '0');
                    timeStr = hours + ':' + minutes;
                }
            }

            // 3. 日付と時間を組み合わせる
            displayDate = dateStr + (timeStr ? ' ' + timeStr : '');
        }

        eventDate.textContent = displayDate;

        // その他の情報を設定
        var locationText = "";
        var descriptionText = "";
        var groupText = "";

        // extendedProps のチェック
        if (event.extendedProps) {
            locationText = event.extendedProps.location || "";
            descriptionText = event.extendedProps.description || "";
            groupText = event.extendedProps.group || "";
        } else {
            // 直接プロパティ
            locationText = event.location || "";
            descriptionText = event.description || "";
            groupText = event.group || "";
        }

        eventLocation.textContent = locationText;
        eventDescription.textContent = descriptionText;
        eventGroup.textContent = groupText;

        // 画像のソースを設定
        eventImage.src = groupImages[groupText] || 'img/default_image.jpg';

        // 詳細パネルを表示
        eventDetails.classList.add('show');

        // モバイルモードの場合のみオーバーレイを表示
        if (window.innerWidth <= 768) {
            overlay.style.display = 'block';
        }
    }

    // カレンダー初期化関数
    function initializeCalendar(events) {
        currentEvents = events; // イベントデータを保存

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            headerToolbar: {
                left: 'title',
                right: 'prev,next today,dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: '今日',
                month: 'M',
                week: 'W',
                day: 'D'
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
            },
            events: events.filter(function(event) {
                return activeGroups.has(event.group);
            }),
            // モバイルモードか PC モードに応じてイベント表示をカスタマイズ
            eventContent: function(arg) {
                var isAllDay = arg.event.allDay;

                // モバイルモードかつ月表示の場合
                if (isMobile && arg.view.type === 'dayGridMonth') {
                    var eventGroup = arg.event.extendedProps.group;
                    var eventColor = groupColors[eventGroup] || '#000000';

                    // カスタム表示のためのコンテナを作成
                    var container = document.createElement('div');
                    container.style.width = '100%';
                    container.style.padding = '2px 4px';
                    container.style.borderRadius = '2px';
                    container.style.backgroundColor = eventColor;
                    container.style.color = '#fff';
                    container.style.fontSize = '0.85em';
                    container.style.whiteSpace = 'nowrap';
                    container.style.overflow = 'hidden';
                    container.style.textOverflow = 'ellipsis';
                    container.style.marginBottom = '2px';

                    // イベント名のみを表示
                    container.textContent = arg.event.title;

                    // 終日イベントの場合、アイコンを追加
                    if (isAllDay) {
                        var badge = document.createElement('span');
                        badge.textContent = '終日';
                        badge.style.fontSize = '0.7em';
                        badge.style.padding = '1px 3px';
                        badge.style.borderRadius = '3px';
                        badge.style.backgroundColor = 'rgba(255,255,255,0.3)';
                        badge.style.marginRight = '4px';

                        container.prepend(badge);
                    }

                    return { domNodes: [container] };
                }
                // PCモードの月表示の場合
                else if (!isMobile && arg.view.type === 'dayGridMonth') {
                    var eventGroup = arg.event.extendedProps.group;
                    var eventColor = groupColors[eventGroup] || '#000000';

                    // カスタムHTMLを返す
                    var timeText = isAllDay ? '終日' : arg.timeText;

                    return {
                        html: '<div style="display: flex; align-items: center; width: 100%; overflow: hidden;">' +
                            '<div style="min-width: 8px; min-height: 8px; width: 8px; height: 8px; border-radius: 50%; background-color: ' + eventColor + '; margin-right: 4px; flex-shrink: 0;"></div>' +
                            '<div class="fc-event-time" style="margin-right: 4px; white-space: nowrap; flex-shrink: 0;">' + timeText + '</div>' +
                            '<div class="fc-event-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + arg.event.title + '</div>' +
                            '</div>'
                    };
                }
                // 他のビュー（週表示、日表示）の場合
                var timeDisplayText = isAllDay ? '終日' : arg.timeText;

                return {
                    html: '<div class="fc-event-time">' + timeDisplayText + '</div>' +
                        '<div class="fc-event-title">' + arg.event.title + '</div>'
                };
            },
            eventClick: function(info) {
                if (window.innerWidth <= 768) {
                    // モバイルモードの場合
                    // 現在のビューを取得
                    var currentView = calendar.view.type;

                    // 月表示の場合はイベントリストを表示
                    if (currentView === 'dayGridMonth') {
                        // 月表示の場合、まずイベントリストを表示
                        var sameDay = getEventsOnSameDay(info.event.start, currentEvents);
                        showEventList(info.event.start, sameDay);
                    } else {
                        // 日表示と週表示の場合は直接イベント詳細を表示
                        showEventDetails(info.event, info.el.textContent);
                    }
                } else {
                    // PCの場合、直接イベント詳細を表示
                    // イベント要素のテキストコンテンツを取得（表示されている時間を含む）
                    var displayText = info.el.textContent;
                    showEventDetails(info.event, displayText);
                }
            },
            // 日付セルのクリックイベント（モバイルでのみ機能）
            dateClick: function(info) {
                if (window.innerWidth <= 768) {
                    var sameDay = getEventsOnSameDay(info.date, currentEvents);
                    showEventList(info.date, sameDay);
                }
            },
            views: {
                // 週表示のカスタマイズ
                timeGridWeek: {
                    // 週表示のときのタイトルフォーマットをカスタマイズ
                    titleFormat: { year: 'numeric', month: 'long' },
                    // カスタムの日付ヘッダー内容
                    dayHeaderContent: function(args) {
                        var weekday = weekdayNames[args.date.getDay()];
                        var day = args.date.getDate();

                        // 曜日と日付を含むHTMLを返す
                        return {
                            html: '<div style="display: flex; flex-direction: column; align-items: center;">' +
                                '<div style="font-size: 0.8em; color: #666;">' + weekday + '</div>' +
                                '<div style="font-size: 1.2em; font-weight: bold;">' + day + '</div>' +
                                '</div>'
                        };
                    }
                },
                // 日表示のカスタマイズ
                timeGridDay: {
                    // 日表示のときのタイトルフォーマットをカスタマイズ
                    titleFormat: { year: 'numeric', month: 'long' },
                    // 日表示の曜日ヘッダーを非表示にする（後でカスタムヘッダーを追加するため）
                    dayHeaderFormat: { weekday: 'short' },
                    // カスタムの日付ヘッダー内容
                    dayHeaderContent: function(args) {
                        var weekday = weekdayNames[args.date.getDay()];
                        var day = args.date.getDate();

                        // 曜日と日付を含むHTMLを返す
                        return {
                            html: '<div style="display: flex; flex-direction: column; align-items: center;">' +
                                '<div style="font-size: 0.8em; color: #666;">' + weekday + '</div>' +
                                '<div style="font-size: 1.2em; font-weight: bold;">' + day + '</div>' +
                                '</div>'
                        };
                    }
                }
            }
        });

        calendar.render();
    }

    fetchEventData().then(function(events) {
        // カレンダーを初期化
        initializeCalendar(events);

        // スワイプ機能の実装
        calendarEl.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        calendarEl.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(calendar);
        }, false);

        // スワイプ処理関数
        function handleSwipe(calendar) {
            var swipeDistance = touchEndX - touchStartX;

            if (Math.abs(swipeDistance) >= minSwipeDistance) {
                // 左スワイプ（次の期間へ）
                if (swipeDistance < 0) {
                    calendar.next();
                }
                // 右スワイプ（前の期間へ）
                else {
                    calendar.prev();
                }
            }
        }

        // フィードバック用のスワイプインジケータ
        var swipeIndicator = document.createElement('div');
        swipeIndicator.id = 'swipe-indicator';
        document.body.appendChild(swipeIndicator);

        // スワイプ中の視覚的フィードバック
        calendarEl.addEventListener('touchmove', function(e) {
            var currentX = e.changedTouches[0].screenX;
            var difference = currentX - touchStartX;

            if (Math.abs(difference) > 20) {
                var opacity = Math.min(Math.abs(difference) / 200, 0.3);
                var direction = difference > 0 ? '←' : '→';

                swipeIndicator.style.opacity = opacity;
                swipeIndicator.style.left = difference > 0 ? '20px' : 'auto';
                swipeIndicator.style.right = difference < 0 ? '20px' : 'auto';
                swipeIndicator.textContent = direction;
                swipeIndicator.classList.add('active');
            }
        }, false);

        calendarEl.addEventListener('touchend', function() {
            swipeIndicator.classList.remove('active');
            swipeIndicator.style.opacity = 0;
        }, false);

        // グループフィルターの作成
        Object.keys(groupColors).forEach(function(group) {
            var button = document.createElement('div');
            button.classList.add('group-filter', 'active');
            button.textContent = group;
            button.style.backgroundColor = groupColors[group];
            button.onclick = function() {
                if (activeGroups.has(group)) {
                    activeGroups.delete(group);
                    button.classList.remove('active');
                    button.style.backgroundColor = "#ddd";
                } else {
                    activeGroups.add(group);
                    button.classList.add('active');
                    button.style.backgroundColor = groupColors[group];
                }
                updateCalendarEvents(calendar, events);
            };
            groupFiltersContainer.appendChild(button);
        });
    });

    // 閉じるボタンのイベントハンドラ
    document.getElementById('close-details').addEventListener('click', function() {
        eventDetails.classList.remove('show');
        overlay.style.display = 'none';
    });

    document.getElementById('close-event-list').addEventListener('click', function() {
        eventListContainer.classList.remove('show');
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function() {
        // 詳細パネルとイベントリストを閉じる
        eventDetails.classList.remove('show');
        eventListContainer.classList.remove('show');
        // オーバーレイを非表示
        overlay.style.display = 'none';
    });

    // デバウンス関数（ウィンドウリサイズイベントの連続発火を防止）
    function debounce(func, wait) {
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }

    // ウィンドウサイズの変更を検知して、カレンダーの表示を更新（デバウンス処理付き）
    window.addEventListener('resize', debounce(function() {
        updateAllEventStyles();
    }, 250));

    // タッチイベントの追加（イベント詳細パネル用）
    var startY;

    eventDetails.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
        }
    });

    eventDetails.addEventListener('touchmove', function(e) {
        var currentY = e.touches[0].clientY;
        var scrollTop = eventDetails.scrollTop;
        var isAtTop = scrollTop === 0;

        if (isAtTop && currentY - startY > 50) {
            eventDetails.classList.remove('show');
            overlay.style.display = 'none';
        }
    });

    // タッチイベントの追加（イベントリスト用）
    eventListContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
        }
    });

    eventListContainer.addEventListener('touchmove', function(e) {
        var currentY = e.touches[0].clientY;
        var scrollTop = eventListContainer.scrollTop;
        var isAtTop = scrollTop === 0;

        if (isAtTop && currentY - startY > 50) {
            eventListContainer.classList.remove('show');
            overlay.style.display = 'none';
        }
    });
});