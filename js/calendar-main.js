// Main script file to orchestrate calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    var calendarEl = document.getElementById('calendar');
    var eventDetails = document.getElementById('event-details');
    var overlay = document.getElementById('overlay');
    var eventListContainer = document.getElementById('event-list-container');
    var groupFiltersContainer = document.getElementById('group-filters');

    // Global variables
    var calendar; // カレンダーインスタンス
    var isMobile = window.innerWidth <= 768; // 現在のビューがモバイルかどうか
    var currentEvents = []; // イベントデータを保持する変数

    // イベントリストから詳細パネルが開かれたかどうかを追跡するグローバルフラグ
    window.detailOpenedFromList = false;

    // スワイプ関連の変数
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 50; // スワイプと認識する最小距離

    // Initialize application with retry mechanism
    initAppWithRetry();

    function initAppWithRetry(retryCount = 0) {
        // Check if calendar element is available
        if (!calendarEl) {
            console.error('Calendar element not found!');
            return;
        }

        // Load event data with retry mechanism
        CalendarData.fetchEventData()
            .then(function(events) {
                currentEvents = events;

                // Initialize calendar
                initializeCalendar(events);

                // Setup swipe functionality
                setupSwipeGestures();

                // Create group filters
                createGroupFilters(events);
            })
            .catch(function(error) {
                console.error('Error loading calendar data:', error);
                if (retryCount < 3) {
                    // Retry after a short delay
                    setTimeout(function() {
                        initAppWithRetry(retryCount + 1);
                    }, 1000);
                } else {
                    // Show an error message to the user
                    calendarEl.innerHTML = '<div style="padding: 20px; text-align: center;">カレンダーデータの読み込みに失敗しました。ページを再読み込みしてください。</div>';
                }
            });

        // Setup event listeners
        setupEventListeners();
    }

    function initializeCalendar(events) {
        try {
            // Make sure FullCalendar is available
            if (typeof FullCalendar === 'undefined') {
                throw new Error('FullCalendar library not loaded');
            }

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
                    return CalendarData.activeGroups.has(event.group);
                }),
                // モバイルモードか PC モードに応じてイベント表示をカスタマイズ
                eventContent: function(arg) {
                    return CalendarUI.formatEventContent(arg, isMobile);
                },
                eventClick: function(info) {
                    handleEventClick(info);
                },
                // 日付セルのクリックイベント（モバイルでのみ機能）
                dateClick: function(info) {
                    if (window.innerWidth <= 768) {
                        var sameDay = CalendarUI.getEventsOnSameDay(info.date, currentEvents);
                        CalendarUI.showEventList(info.date, sameDay, eventListContainer);
                    }
                },
                views: {
                    // 週表示のカスタマイズ
                    timeGridWeek: {
                        // 週表示のときのタイトルフォーマットをカスタマイズ
                        titleFormat: { year: 'numeric', month: 'long' },
                        // カスタムの日付ヘッダー内容
                        dayHeaderContent: function(args) {
                            return CalendarUI.formatDayHeader(args);
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
                            return CalendarUI.formatDayHeader(args);
                        }
                    }
                }
            });

            calendar.render();
            console.log('Calendar successfully rendered');

            // Hide loading indicator if it exists
            var loadingIndicator = document.getElementById('calendar-loading');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        } catch (error) {
            console.error('Error initializing calendar:', error);
            // Show error message in calendar container
            calendarEl.innerHTML = '<div style="padding: 20px; text-align: center;">カレンダーの初期化に失敗しました。ページを再読み込みしてください。</div>';
        }
    }

    function handleEventClick(info) {
        if (window.innerWidth <= 768) {
            // モバイルモードの場合
            // 現在のビューを取得
            var currentView = calendar.view.type;

            // 月表示の場合はイベントリストを表示
            if (currentView === 'dayGridMonth') {
                // 月表示の場合、まずイベントリストを表示
                var sameDay = CalendarUI.getEventsOnSameDay(info.event.start, currentEvents);
                CalendarUI.showEventList(info.event.start, sameDay, eventListContainer);
            } else {
                // 日表示と週表示の場合は直接イベント詳細を表示
                CalendarUI.showEventDetails(info.event, info.el.textContent, eventDetails);
            }
        } else {
            // PCの場合、直接イベント詳細を表示
            // イベント要素のテキストコンテンツを取得（表示されている時間を含む）
            var displayText = info.el.textContent;
            CalendarUI.showEventDetails(info.event, displayText, eventDetails);
        }
    }

    function setupEventListeners() {
        // Close buttons
        var closeDetailsBtn = document.getElementById('close-details');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', function() {
                eventDetails.classList.remove('show');

                // イベントリストから開かれた場合、リストに戻る
                if (window.detailOpenedFromList && window.innerWidth <= 768) {
                    eventListContainer.classList.add('show');
                    // オーバーレイは表示したまま
                } else {
                    overlay.style.display = 'none';
                }

                // フラグをリセット
                window.detailOpenedFromList = false;
            });
        }

        var closeEventListBtn = document.getElementById('close-event-list');
        if (closeEventListBtn) {
            closeEventListBtn.addEventListener('click', function() {
                eventListContainer.classList.remove('show');
                overlay.style.display = 'none';
                // フラグをリセット
                window.detailOpenedFromList = false;
            });
        }

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', function() {
                // 詳細パネルとイベントリストを閉じる
                eventDetails.classList.remove('show');
                eventListContainer.classList.remove('show');
                // オーバーレイを非表示
                overlay.style.display = 'none';
                // フラグをリセット
                window.detailOpenedFromList = false;
            });
        }

        // Window resize
        window.addEventListener('resize', debounce(function() {
            updateAllEventStyles();
        }, 250));

        // Touch events for detail panel
        setupTouchEvents();
    }

    // calendar-main.js の既存の setupTouchEvents 関数を置き換えます
    function setupTouchEvents() {
        // スワイプ関連の変数
        var startY = 0;
        var currentY = 0;
        var isDragging = false;
        var initialPanelPosition = 0;
        var touchStartTime = 0;

        // イベント詳細パネルのスワイプ処理
        var eventDetailsPanel = document.getElementById('event-details');

        eventDetailsPanel.addEventListener('touchstart', function(e) {
            if (e.touches.length !== 1) return; // 単一タッチのみ処理

            startY = e.touches[0].clientY;
            initialPanelPosition = eventDetailsPanel.getBoundingClientRect().top;
            touchStartTime = Date.now();
            isDragging = false;

            // コンテンツのスクロールは許可するため、preventDefaultは最小限に
            if (eventDetailsPanel.scrollTop <= 0 && e.target.closest('#close-details')) {
                e.preventDefault();
            }
        }, { passive: false });

        eventDetailsPanel.addEventListener('touchmove', function(e) {
            if (e.touches.length !== 1) return;

            // スクロール位置が最上部なら、またはハンドル部分ならスワイプを許可
            if (eventDetailsPanel.scrollTop <= 0 || e.target.closest('#close-details')) {
                currentY = e.touches[0].clientY;
                var deltaY = currentY - startY;

                // 下方向へのスワイプのみ処理（deltaY > 0）
                if (deltaY > 0) {
                    isDragging = true;

                    // パネルを物理的に移動
                    var newPosition = Math.min(deltaY, window.innerHeight);
                    eventDetailsPanel.style.transition = 'none';
                    eventDetailsPanel.style.transform = 'translateY(' + newPosition + 'px)';

                    // スクロールの代わりにパネル移動
                    if (eventDetailsPanel.scrollTop <= 0) {
                        e.preventDefault();
                    }
                }
            }
        }, { passive: false });

        eventDetailsPanel.addEventListener('touchend', function(e) {
            if (!isDragging) return;

            var endY = e.changedTouches[0].clientY;
            var deltaY = endY - startY;
            var touchDuration = Date.now() - touchStartTime;
            var velocity = deltaY / touchDuration;

            // スワイプ判定の閾値
            // 1. 移動距離が画面高さの30%以上
            // 2. または、スワイプの速度が0.5以上（速いスワイプ）
            if (deltaY > window.innerHeight * 0.3 || velocity > 0.5) {
                // パネルを閉じる（スムーズなアニメーションで）
                eventDetailsPanel.style.transition = 'transform 0.3s ease-out';
                eventDetailsPanel.style.transform = 'translateY(' + window.innerHeight + 'px)';

                // アニメーション完了後にクラスを削除
                setTimeout(function() {
                    eventDetailsPanel.classList.remove('show');
                    eventDetailsPanel.style.transform = 'translateY(0)';

                    // イベントリストから開かれた場合、リストに戻る
                    if (window.detailOpenedFromList && window.innerWidth <= 768) {
                        eventListContainer.classList.add('show');
                    } else {
                        overlay.style.display = 'none';
                    }

                    // フラグをリセット
                    window.detailOpenedFromList = false;
                }, 300);
            } else {
                // 閾値未満ならパネルを元の位置に戻す
                eventDetailsPanel.style.transition = 'transform 0.2s ease-out';
                eventDetailsPanel.style.transform = 'translateY(0)';
            }

            isDragging = false;
        });

        // イベントリストコンテナのスワイプ処理も同様に実装
        var eventListPanel = document.getElementById('event-list-container');

        eventListPanel.addEventListener('touchstart', function(e) {
            if (e.touches.length !== 1) return;

            startY = e.touches[0].clientY;
            initialPanelPosition = eventListPanel.getBoundingClientRect().top;
            touchStartTime = Date.now();
            isDragging = false;

            // ハンドル部分のみpreventDefault
            if (eventListPanel.scrollTop <= 0 && e.target.closest('#close-event-list')) {
                e.preventDefault();
            }
        }, { passive: false });

        eventListPanel.addEventListener('touchmove', function(e) {
            if (e.touches.length !== 1) return;

            // スクロール位置が最上部またはハンドル部分ならスワイプを許可
            if (eventListPanel.scrollTop <= 0 || e.target.closest('#close-event-list')) {
                currentY = e.touches[0].clientY;
                var deltaY = currentY - startY;

                // 下方向へのスワイプのみ処理（deltaY > 0）
                if (deltaY > 0) {
                    isDragging = true;

                    // パネルを物理的に移動
                    var newPosition = Math.min(deltaY, window.innerHeight);
                    eventListPanel.style.transition = 'none';
                    eventListPanel.style.transform = 'translateY(' + newPosition + 'px)';

                    // スクロールの代わりにパネル移動
                    if (eventListPanel.scrollTop <= 0) {
                        e.preventDefault();
                    }
                }
            }
        }, { passive: false });

        eventListPanel.addEventListener('touchend', function(e) {
            if (!isDragging) return;

            var endY = e.changedTouches[0].clientY;
            var deltaY = endY - startY;
            var touchDuration = Date.now() - touchStartTime;
            var velocity = deltaY / touchDuration;

            // スワイプ判定の閾値
            if (deltaY > window.innerHeight * 0.3 || velocity > 0.5) {
                // パネルを閉じる（スムーズなアニメーションで）
                eventListPanel.style.transition = 'transform 0.3s ease-out';
                eventListPanel.style.transform = 'translateY(' + window.innerHeight + 'px)';

                // アニメーション完了後にクラスを削除
                setTimeout(function() {
                    eventListPanel.classList.remove('show');
                    eventListPanel.style.transform = 'translateY(0)';
                    overlay.style.display = 'none';
                }, 300);
            } else {
                // 閾値未満ならパネルを元の位置に戻す
                eventListPanel.style.transition = 'transform 0.2s ease-out';
                eventListPanel.style.transform = 'translateY(0)';
            }

            isDragging = false;
        });

        // ヘッダー部分（閉じるボタン）のタッチイベントはより単純化
        var closeDetailsBtn = document.getElementById('close-details');
        closeDetailsBtn.addEventListener('click', function() {
            eventDetailsPanel.classList.remove('show');

            // イベントリストから開かれた場合、リストに戻る
            if (window.detailOpenedFromList && window.innerWidth <= 768) {
                eventListContainer.classList.add('show');
            } else {
                overlay.style.display = 'none';
            }

            // フラグをリセット
            window.detailOpenedFromList = false;
        });

        var closeEventListBtn = document.getElementById('close-event-list');
        closeEventListBtn.addEventListener('click', function() {
            eventListPanel.classList.remove('show');
            overlay.style.display = 'none';
            // フラグをリセット
            window.detailOpenedFromList = false;
        });
    }

    function setupSwipeGestures() {
        // Swipe handling
        calendarEl.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        calendarEl.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        // Swipe indicator
        var swipeIndicator = document.createElement('div');
        swipeIndicator.id = 'swipe-indicator';
        document.body.appendChild(swipeIndicator);

        // Visual feedback during swipe
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
    }

    function handleSwipe() {
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

    function updateCalendarEvents(calendar, events) {
        calendar.removeAllEvents();
        var filteredEvents = events.filter(function(event) {
            return CalendarData.activeGroups.has(event.group);
        });
        filteredEvents.forEach(function(event) {
            calendar.addEvent(event);
        });
    }

    function createGroupFilters(events) {
        Object.keys(CalendarData.groupColors).forEach(function(group) {
            var button = document.createElement('div');
            button.classList.add('group-filter', 'active');
            button.textContent = group;
            button.style.backgroundColor = CalendarData.groupColors[group];
            button.onclick = function() {
                if (CalendarData.activeGroups.has(group)) {
                    CalendarData.activeGroups.delete(group);
                    button.classList.remove('active');
                    button.style.backgroundColor = "#ddd";
                } else {
                    CalendarData.activeGroups.add(group);
                    button.classList.add('active');
                    button.style.backgroundColor = CalendarData.groupColors[group];
                }
                updateCalendarEvents(calendar, events);
            };
            groupFiltersContainer.appendChild(button);
        });
    }

    // デバウンス関数（ウィンドウリサイズイベントの連続発火を防止）
    function debounce(func, wait) {
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }
});