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

    // スワイプ関連の変数
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 50; // スワイプと認識する最小距離

    // Initialize application
    initApp();

    function initApp() {
        // Load event data
        CalendarData.fetchEventData()
            .then(function(events) {
                currentEvents = events;

                // Initialize calendar
                initializeCalendar(events);

                // Setup swipe functionality
                setupSwipeGestures();

                // Create group filters
                createGroupFilters(events);
            });

        // Setup event listeners
        setupEventListeners();
    }

    function initializeCalendar(events) {
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
        document.getElementById('close-details').addEventListener('click', function() {
            eventDetails.classList.remove('show');
            overlay.style.display = 'none';
        });

        document.getElementById('close-event-list').addEventListener('click', function() {
            eventListContainer.classList.remove('show');
            overlay.style.display = 'none';
        });

        // Overlay click
        overlay.addEventListener('click', function() {
            // 詳細パネルとイベントリストを閉じる
            eventDetails.classList.remove('show');
            eventListContainer.classList.remove('show');
            // オーバーレイを非表示
            overlay.style.display = 'none';
        });

        // Window resize
        window.addEventListener('resize', debounce(function() {
            updateAllEventStyles();
        }, 250));

        // Touch events for detail panel
        setupTouchEvents();
    }

    function setupTouchEvents() {
        var startY;

        // Event details panel
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

        // Event list container
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