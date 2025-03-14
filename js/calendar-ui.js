// UI interaction module for calendar
var CalendarUI = (function() {
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

    // Get events for the same day
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

                return eventDateStr === dateStr && CalendarData.activeGroups.has(group);
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

    // Format day header for week and day views
    function formatDayHeader(args) {
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

    // Format event content based on mobile or desktop view
    function formatEventContent(arg, isMobile) {
        var isAllDay = arg.event.allDay;

        // モバイルモードかつ月表示の場合
        if (isMobile && arg.view.type === 'dayGridMonth') {
            var eventGroup = arg.event.extendedProps.group;
            var eventColor = CalendarData.groupColors[eventGroup] || '#000000';

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
            var eventColor = CalendarData.groupColors[eventGroup] || '#000000';

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
    }

    // Show event list
    function showEventList(date, events, eventListContainer) {
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
            events.forEach(function(event, index) {
                var eventItem = document.createElement('div');
                eventItem.className = 'event-list-item';

                // イベントIDを確実に取得
                let eventId = event.id;
                if (!eventId) {
                    // IDがない場合は一意のIDを生成して設定
                    const dateStr = typeof event.start === 'string' ? event.start.split('T')[0] :
                        (event.start instanceof Date ? event.start.toISOString().split('T')[0] : '');
                    eventId = 'event-' + index + '-' + dateStr + '-' + Date.now();
                    event.id = eventId;
                } else {
                    //console.log('リストで既存のイベントIDを使用:', eventId);
                }

                // データ属性としてDOMに保存
                eventItem.dataset.eventId = eventId;

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

                // お気に入りアイコン用のspan要素
                var favoriteIcon = document.createElement('span');
                favoriteIcon.className = 'event-list-favorite';
                const isFav = window.EventFavorites && window.EventFavorites.isFavorite(eventId);
                //console.log('リストでのお気に入りチェック - イベントID:', eventId, 'お気に入り:', isFav);

                favoriteIcon.textContent = isFav ? '★' : '☆';
                favoriteIcon.style.color = isFav ? '#FFD700' : '#ccc';
                favoriteIcon.style.fontSize = '18px';
                favoriteIcon.style.marginRight = '8px';
                favoriteIcon.style.cursor = 'pointer';

                // お気に入りアイコンのクリックイベント
                favoriteIcon.addEventListener('click', function(e) {
                    e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
                    //console.log('リストでお気に入りアイコンがクリックされました - イベントID:', eventId);

                    if (window.EventFavorites) {
                        const isFavorite = window.EventFavorites.toggleFavorite(eventId);
                        //console.log('トグル後の状態:', isFavorite);

                        favoriteIcon.textContent = isFavorite ? '★' : '☆';
                        favoriteIcon.style.color = isFavorite ? '#FFD700' : '#ccc';

                        // お気に入りフィルターが適用されている場合はカレンダーを更新
                        if (window.showOnlyFavorites) {
                            window.updateCalendarEvents(window.calendar, window.currentEvents);
                        }

                        // デバッグ: 現在のお気に入りリストを表示
                        window.EventFavorites.debugShowFavorites();
                    }
                });

                // イベントリストの内容を作成
                eventItem.innerHTML =
                    '<div class="event-list-time">' + formattedTime + '</div>' +
                    '<div class="event-list-content">' +
                    '<div class="event-list-title">' + event.title + '</div>' +
                    '<div class="event-list-group" style="color: ' + CalendarData.groupColors[groupValue] + '">' + groupValue + '</div>' +
                    '</div>';

                // お気に入りアイコンを挿入
                eventItem.insertBefore(favoriteIcon, eventItem.firstChild);

                // ここが重要: タップ機能を追加
                eventItem.addEventListener('click', function(e) {
                    // タップイベントが正しく発火するように、ドラッグ中のクリックイベントをキャンセル
                    // スワイプで閉じる機能で追加した変数を使用
                    if (window.isDraggingEventList) {
                        return; // スワイプ中なら何もしない
                    }

                    var eventDetailsEl = document.getElementById('event-details');

                    // 詳細パネルを表示
                    showEventDetails(event, formattedTime + ' ' + event.title, eventDetailsEl);

                    // イベントリストは非表示にするが、detailOpenedFromListフラグを設定
                    eventListContainer.classList.remove('show');

                    // グローバルフラグを設定（calendar-main.jsで参照）
                    window.detailOpenedFromList = true;
                });

                eventListEl.appendChild(eventItem);
            });
        }

        // Find or create a container for the share all button
        var shareAllButtonContainer = document.getElementById('share-all-button-container');
        if (!shareAllButtonContainer) {
            shareAllButtonContainer = document.createElement('div');
            shareAllButtonContainer.id = 'share-all-button-container';
            shareAllButtonContainer.style.textAlign = 'center';
            shareAllButtonContainer.style.marginTop = '15px';
            shareAllButtonContainer.style.marginBottom = '15px';
            shareAllButtonContainer.style.display = 'flex';
            shareAllButtonContainer.style.justifyContent = 'center';
            shareAllButtonContainer.style.flexWrap = 'wrap';

            // Get the event list element
            var eventListEl = document.getElementById('event-list');

            // Insert after the event list
            if (eventListEl.nextSibling) {
                eventListContainer.insertBefore(shareAllButtonContainer, eventListEl.nextSibling);
            } else {
                eventListContainer.appendChild(shareAllButtonContainer);
            }
        }

        // Clear previous buttons
        shareAllButtonContainer.innerHTML = '';

        // Only add the share buttons if there are events
        if (events.length > 0) {
            // Create a button to share all events
            var shareAllButton = EventSharing.createShareButton(function() {
                EventSharing.shareDayEvents(date, events);
            });

            // Create X (Twitter) share button
            var xShareButton = EventSharing.createXShareButton(function() {
                EventSharing.shareEventsToX(date, events);
            });

            // Add text to indicate it's for sharing all
            shareAllButton.textContent = 'この日のイベントをシェア';

            // スタイルの修正 - 共通スタイル
            var commonButtonStyle = {
                width: '48%',
                maxWidth: '220px',
                minWidth: 'fit-content', // より適切なfit-contentを使用
                margin: '10px 5px',
                display: 'inline-flex', // inline-blockからinline-flexに変更
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap', // テキストが折り返さないようにする
                overflow: 'hidden', // はみ出した分は非表示
                textOverflow: 'ellipsis', // はみ出した部分は省略記号に
                flexShrink: 0 // 追加: ボタンが縮まないようにする
            };

            // シェアボタンのスタイル適用
            Object.assign(shareAllButton.style, commonButtonStyle);

            // Xボタンのスタイル適用
            Object.assign(xShareButton.style, commonButtonStyle);

            // SVGアイコンを再追加（テキスト設定でSVGが消えるため）
            var shareIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            shareIcon.setAttribute('width', '16');
            shareIcon.setAttribute('height', '16');
            shareIcon.setAttribute('viewBox', '0 0 24 24');
            shareIcon.setAttribute('fill', 'none');
            shareIcon.setAttribute('stroke', 'currentColor');
            shareIcon.setAttribute('stroke-width', '2');
            shareIcon.setAttribute('stroke-linecap', 'round');
            shareIcon.setAttribute('stroke-linejoin', 'round');
            shareIcon.innerHTML = '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>';

            // テキストノードを作成
            var shareText = document.createTextNode(' この日のイベントをシェア');

            // ボタンの中身をクリアして再構築
            shareAllButton.innerHTML = '';
            shareAllButton.appendChild(shareIcon);
            shareAllButton.appendChild(shareText);

            // Xボタンも同様に再構築
            var xIcon = document.createElement('span');
            xIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>';
            var xText = document.createTextNode(' 投稿');

            xShareButton.innerHTML = '';
            xShareButton.appendChild(xIcon);
            xShareButton.appendChild(xText);

            // Add the share buttons to the container
            shareAllButtonContainer.appendChild(shareAllButton);
            shareAllButtonContainer.appendChild(xShareButton);
        }

        // イベントリストコンテナを表示
        eventListContainer.classList.add('show');

        // オーバーレイを必ず表示
        document.getElementById('overlay').style.display = 'block';
    }
    // Show event details
    function showEventDetails(event, displayText, eventDetailsEl) {
        var eventTitle = document.getElementById('event-title');
        var eventDate = document.getElementById('event-date');
        var eventLocation = document.getElementById('event-location');
        var eventDescription = document.getElementById('event-description');
        var eventGroup = document.getElementById('event-group');
        var eventImage = document.getElementById('event-image');
        var eventImageWebp = document.getElementById('event-image-webp');

        // デバッグ: イベントオブジェクトの構造を確認
        //console.log('イベントオブジェクト:', event);
        if (event._def) {
            //console.log('イベント内部構造:', event._def);
        }

        // FullCalendarのイベントオブジェクトから情報を取得するヘルパー関数
        function getEventProp(prop) {
            if (event.extendedProps && event.extendedProps[prop] !== undefined) {
                return event.extendedProps[prop];
            }
            if (event[prop] !== undefined) {
                return event[prop];
            }
            // rawEventに対応（FullCalendarの内部構造）
            if (event._def && event._def.extendedProps && event._def.extendedProps[prop] !== undefined) {
                return event._def.extendedProps[prop];
            }
            return '';
        }

        // タイトルの設定
        eventTitle.textContent = event.title || (event._def ? event._def.title : '');

        // 日付と時間の処理
        var displayDate = '';
        var isAllDayEvent = false; // 終日イベントかどうかのフラグ

        if (event.allDay || (event._def && event._def.allDay)) {
            // 終日イベントの処理
            isAllDayEvent = true; // 終日イベントフラグをセット
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

                // 開始日と終了日が同じ場合は単一日表示
                if (startStr === endStr) {
                    displayDate = startStr + ' (終日)';
                } else {
                    // 開始日と終了日が異なる場合のみ範囲表示
                    displayDate = startStr + ' 〜 ' + endStr + ' (終日)';
                }
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
        var locationText = getEventProp('location');
        var descriptionText = getEventProp('description');
        var groupText = getEventProp('group');

        // グループがない場合はFCイベントから取得を試みる
        if (!groupText && event._def && event._def.ui && event._def.ui.backgroundColor) {
            // 色からグループを推測
            Object.keys(CalendarData.groupColors).forEach(function(group) {
                if (CalendarData.groupColors[group] === event._def.ui.backgroundColor) {
                    groupText = group;
                }
            });
        }

        // 場所の表示（終日イベントでは非表示）
        // 場所を含む段落要素を探す
        var locationElement = null;
        var paragraphs = eventDetailsEl.querySelectorAll('p');
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].textContent.indexOf('場所:') !== -1) {
                locationElement = paragraphs[i];
                break;
            }
        }

        if (locationElement) {
            if (isAllDayEvent) {
                // 終日イベントの場合は場所を非表示
                locationElement.style.display = 'none';
            } else {
                // 通常イベントの場合は場所を表示
                locationElement.style.display = '';
                eventLocation.textContent = locationText;
            }
        }

        // 説明欄のタイトルを変更（終日イベントの場合は「説明:」、それ以外は「開場:」）
        var descriptionElement = null;
        var descriptionLabel = null;
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].textContent.indexOf('説明:') !== -1) {
                descriptionElement = paragraphs[i];
                var strongElements = paragraphs[i].querySelectorAll('strong');
                for (var j = 0; j < strongElements.length; j++) {
                    if (strongElements[j].textContent.indexOf('説明:') !== -1) {
                        descriptionLabel = strongElements[j];
                        break;
                    }
                }
                break;
            }
        }

        if (descriptionLabel) {
            // 終日イベントでない場合のみ「開場:」に変更
            if (!isAllDayEvent) {
                descriptionLabel.textContent = '開場:';
            } else {
                // 終日イベントの場合は「説明:」のまま
                descriptionLabel.textContent = '説明:';
            }
        }

        // 説明欄の処理 - 日時情報かURLかを判断
        if (descriptionText) {
            // URLの場合
            var urlRegex = /^https?:\/\/[^\s]+$/;
            if (urlRegex.test(descriptionText.trim())) {
                var url = descriptionText.trim();
                // URLの場合はリンクを作成
                eventDescription.innerHTML = '<a href="' + url + '" target="_blank">オフィシャルサイトの情報ページへ</a>';
            }
            // 時間指定イベントで、ISO形式の日時の場合（例: 1899-12-30T06:00:00.000Z）
            else if (!isAllDayEvent && descriptionText.includes('T') && (descriptionText.includes('Z') || descriptionText.includes('+'))) {
                try {
                    // ISO文字列を解析してDate型に変換
                    var timeDate = new Date(descriptionText);
                    if (!isNaN(timeDate.getTime())) {
                        // 時間だけを抽出（日本時間に合わせる）
                        var hours = timeDate.getUTCHours() + 9;
                        if (hours >= 24) hours -= 24;
                        var minutes = timeDate.getUTCMinutes();

                        // フォーマットされた時間を表示
                        var formattedTime = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
                        eventDescription.textContent = formattedTime;
                    } else {
                        // 解析に失敗した場合はそのまま表示
                        eventDescription.textContent = descriptionText;
                    }
                } catch (e) {
                    // エラーが発生した場合はそのまま表示
                    eventDescription.textContent = descriptionText;
                }
            } else {
                // 通常のテキストの場合
                eventDescription.textContent = descriptionText;
            }
        } else {
            eventDescription.textContent = '';
        }

        eventGroup.textContent = groupText;

        // 画像のソースを設定 (WebP対応)
        // CalendarDataのgetOptimalGroupImagePath関数を使用
        if (CalendarData && typeof CalendarData.getOptimalGroupImagePath === 'function') {
            const imageSrc = CalendarData.getOptimalGroupImagePath(groupText);

            // WebP source要素を持つpicture要素を使う場合
            if (eventImageWebp) {
                // WebP対応ブラウザ用のsource要素を更新
                if (window.ImageHelper && ImageHelper.checkWebPSupport()) {
                    const webpSrc = imageSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
                    eventImageWebp.srcset = webpSrc;
                }
                eventImage.src = imageSrc;
            } else {
                // 通常のimg要素のみの場合
                eventImage.src = imageSrc;
            }
        } else {
            // 従来の方法にフォールバック
            eventImage.src = CalendarData && CalendarData.groupImages ?
                CalendarData.groupImages[groupText] || 'img/default_image.jpg' :
                'img/default_image.jpg';
        }

        // イベントIDを確実に取得
        let eventId;
        if (event.id) {
            eventId = event.id;
            //console.log('詳細パネルで既存のイベントIDを使用:', eventId);
        } else if (event.extendedProps && event.extendedProps.eventId) {
            // extendedPropsからIDを取得
            eventId = event.extendedProps.eventId;
            //console.log('詳細パネルでextendedPropsからイベントIDを取得:', eventId);
        } else if (event._def && event._def.publicId) {
            // FullCalendarの内部構造からIDを取得
            eventId = event._def.publicId;
            //console.log('詳細パネルでFullCalendarの内部IDを使用:', eventId);
        } else if (window.tempEventId) {
            // 一時保存されたIDを使用
            eventId = window.tempEventId;
            //console.log('詳細パネルで一時保存されたイベントIDを使用:', eventId);
            // 使用後はクリア
            window.tempEventId = null;
        } else {
            // 新規IDを生成
            const titleStr = event.title || (event._def ? event._def.title : 'event');
            const safeTitle = titleStr.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const dateStr = event.start ?
                (typeof event.start === 'string' ? event.start.split('T')[0] :
                    (event.start instanceof Date ? event.start.toISOString().split('T')[0] : '')) :
                new Date().toISOString().split('T')[0];

            eventId = 'event-' + safeTitle + '-' + dateStr + '-' + Math.random().toString(36).substr(2, 5);
            //console.log('詳細パネルで新規イベントIDを生成:', eventId);
        }

        // nullやundefinedを避ける最終チェック
        if (!eventId) {
            eventId = 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            //console.log('詳細パネルでフォールバックイベントIDを生成:', eventId);
        }

        // グローバル変数に現在のイベントIDを保存
        window.currentEventId = eventId;

        // お気に入りボタンの状態を設定
        var favoriteButton = document.getElementById('favorite-button');
        if (favoriteButton && window.EventFavorites) {
            // イベントがお気に入りかどうかで表示を切り替え
            const isFav = window.EventFavorites.isFavorite(eventId);
            //console.log('詳細パネルでのお気に入りチェック - イベントID:', eventId, 'お気に入り:', isFav);

            if (isFav) {
                favoriteButton.classList.add('active');
                favoriteButton.textContent = '★';
            } else {
                favoriteButton.classList.remove('active');
                favoriteButton.textContent = '☆';
            }

            // クリックイベントハンドラを設定
            favoriteButton.onclick = function(e) {
                e.stopPropagation(); // イベントバブリングを防ぐ
                //console.log('詳細パネルでお気に入りボタンがクリックされました - イベントID:', eventId);

                const isFavorite = window.EventFavorites.toggleFavorite(eventId);
                //console.log('トグル後の状態:', isFavorite);

                if (isFavorite) {
                    favoriteButton.classList.add('active');
                    favoriteButton.textContent = '★';
                } else {
                    favoriteButton.classList.remove('active');
                    favoriteButton.textContent = '☆';
                }

                // お気に入りフィルターが適用されている場合はカレンダーを更新
                if (window.showOnlyFavorites) {
                    window.updateCalendarEvents(window.calendar, window.currentEvents);
                }

                // デバッグ: 現在のお気に入りリストを表示
                if (window.EventFavorites.debugShowFavorites) {
                    window.EventFavorites.debugShowFavorites();
                }
            };
        }

        // Find or create a container for the share button
        var shareButtonContainer = document.getElementById('share-button-container');
        if (!shareButtonContainer) {
            shareButtonContainer = document.createElement('div');
            shareButtonContainer.id = 'share-button-container';
            shareButtonContainer.style.textAlign = 'center';
            shareButtonContainer.style.marginTop = '15px';

            // Insert after the event details but before any potential ads
            var detailsEnd = document.querySelector('#event-details p:last-of-type');
            if (detailsEnd && detailsEnd.nextSibling) {
                eventDetailsEl.insertBefore(shareButtonContainer, detailsEnd.nextSibling);
            } else {
                eventDetailsEl.appendChild(shareButtonContainer);
            }
        }

        // Clear previous buttons
        shareButtonContainer.innerHTML = '';

        // Create and add the share button
        var shareButton = EventSharing.createShareButton(function() {
            // Format the date for sharing
            var formattedDate = '';
            if (typeof event.start === 'string') {
                // Parse the string date
                var dateObj = new Date(event.start);
                formattedDate = dateObj.getFullYear() + '年' +
                    (dateObj.getMonth() + 1) + '月' +
                    dateObj.getDate() + '日 (' +
                    weekdayNames[dateObj.getDay()] + ')';
            } else if (event.start instanceof Date) {
                formattedDate = event.start.getFullYear() + '年' +
                    (event.start.getMonth() + 1) + '月' +
                    event.start.getDate() + '日 (' +
                    weekdayNames[event.start.getDay()] + ')';
            } else if (typeof event.start === 'object' && event.start && typeof event.start.toDate === 'function') {
                var fcDate = event.start.toDate();
                formattedDate = fcDate.getFullYear() + '年' +
                    (fcDate.getMonth() + 1) + '月' +
                    fcDate.getDate() + '日 (' +
                    weekdayNames[fcDate.getDay()] + ')';
            }

            // Call the share event function
            EventSharing.shareEvent(event, formattedDate);
        });

        // Add the share button to the container
        shareButtonContainer.appendChild(shareButton);

        // 詳細パネルを表示
        eventDetailsEl.classList.add('show');

        // モバイルモードの場合のみオーバーレイを表示
        if (window.innerWidth <= 768) {
            document.getElementById('overlay').style.display = 'block';
        }
    }
    // Return public API
    return {
        weekdayNames: weekdayNames,
        getEventsOnSameDay: getEventsOnSameDay,
        formatDayHeader: formatDayHeader,
        formatEventContent: formatEventContent,
        showEventList: showEventList,
        showEventDetails: showEventDetails
    };
})();