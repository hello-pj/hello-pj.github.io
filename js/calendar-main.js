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
        // 既存のヘルプボタンがあれば削除
        var existingHelpButton = document.getElementById('help-button');
        if (existingHelpButton) {
            existingHelpButton.parentNode.removeChild(existingHelpButton);
        }

        // 既存のモーダルがあれば削除
        var existingModal = document.getElementById('help-modal');
        if (existingModal) {
            existingModal.parentNode.removeChild(existingModal);
        }

        // グループフィルターをクリア
        groupFiltersContainer.innerHTML = '';

        // グループフィルターを作成
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

        // ヘルプボタンを追加
        var helpButton = document.createElement('div');
        helpButton.id = 'help-button';
        helpButton.classList.add('group-filter');
        helpButton.textContent = '?';

        // スタイル調整
        helpButton.style.backgroundColor = '#f8f8f8';
        helpButton.style.color = '#666';
        helpButton.style.border = '1px solid #666';
        helpButton.style.borderRadius = '50%';
        helpButton.style.width = '24px';
        helpButton.style.height = '24px';
        helpButton.style.minWidth = '24px';
        helpButton.style.maxWidth = '24px';
        helpButton.style.padding = '0';
        helpButton.style.lineHeight = '24px';
        helpButton.style.textAlign = 'center';
        helpButton.style.display = 'flex';
        helpButton.style.alignItems = 'center';
        helpButton.style.justifyContent = 'center';
        helpButton.style.boxSizing = 'border-box';
        helpButton.style.margin = '3px 5px';
        helpButton.style.cursor = 'pointer';

        helpButton.onclick = function(e) {
            e.stopPropagation();
            showHelpModal();
        };

        groupFiltersContainer.appendChild(helpButton);

        // ヘルプモーダルの作成・表示関数
        function showHelpModal() {
            var helpModal = document.getElementById('help-modal');
            if (!helpModal) {
                helpModal = document.createElement('div');
                helpModal.id = 'help-modal';
                helpModal.style.display = 'none';
                helpModal.style.position = 'fixed';
                helpModal.style.zIndex = '2000';
                helpModal.style.left = '0';
                helpModal.style.top = '0';
                helpModal.style.width = '100%';
                helpModal.style.height = '100%';
                helpModal.style.backgroundColor = 'rgba(0,0,0,0.4)';

                var modalContent = document.createElement('div');
                modalContent.style.backgroundColor = '#fefefe';
                modalContent.style.margin = '15% auto';
                modalContent.style.padding = '20px';
                modalContent.style.border = '1px solid #888';
                modalContent.style.width = '80%';
                modalContent.style.maxWidth = '600px';
                modalContent.style.borderRadius = '8px';
                modalContent.style.position = 'relative';

                var closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.color = '#aaa';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '15px';
                closeButton.style.fontSize = '28px';
                closeButton.style.fontWeight = 'bold';
                closeButton.style.cursor = 'pointer';

                closeButton.onclick = function() {
                    helpModal.style.display = 'none';
                };

                var helpText = document.createElement('p');
                helpText.textContent = 'ハロー！プロジェクト所属の各グループ（モーニング娘。\'25、アンジュルム、Juice=Juice、つばきファクトリー、BEYOOOOONDS、OCHA NORMA、ロージークロニクル、ハロプロ研修生）の最新ライブ・コンサートスケジュールをカレンダー形式で確認できます。グループ別のフィルターボタンで、特定のグループの予定だけを表示することができます。';

                modalContent.appendChild(closeButton);
                modalContent.appendChild(helpText);
                helpModal.appendChild(modalContent);
                document.body.appendChild(helpModal);

                // モーダル外クリックで閉じる
                helpModal.onclick = function(event) {
                    if (event.target == helpModal) {
                        helpModal.style.display = 'none';
                    }
                };
            }

            helpModal.style.display = 'block';
        }
    }

    // デバウンス関数（ウィンドウリサイズイベントの連続発火を防止）
    function debounce(func, wait) {
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }

    // Function to ensure header toolbar visibility
    function ensureHeaderVisibility() {
        // Select the header toolbar element
        const headerToolbar = document.querySelector('.fc-header-toolbar');

        if (headerToolbar) {
            // Make sure it's visible
            headerToolbar.style.display = '';
            headerToolbar.style.visibility = 'visible';
            headerToolbar.style.opacity = '1';

            // Also check individual button containers
            const buttonContainers = headerToolbar.querySelectorAll('.fc-button-group, .fc-today-button, .fc-toolbar-title');
            buttonContainers.forEach(container => {
                container.style.display = '';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
            });
        }
    }

    // Run the function periodically to ensure buttons remain visible
    setInterval(ensureHeaderVisibility, 2000);

    // Also run when window is resized or calendar view changes
    window.addEventListener('resize', ensureHeaderVisibility);

    // 修正: FullCalendarのイベントリスナーの正しい使用法
    // calendar.onはFullCalendar 5で動作しない場合があります
    if (typeof calendar !== 'undefined') {
        try {
            // 以前のバージョンのFullCalendarではこれを使用
            if (typeof calendar.on === 'function') {
                calendar.on('viewSkeletonRender', ensureHeaderVisibility);
            }
            // FullCalendar 5ではこの方法を試してみる
            else if (typeof calendar.getOption === 'function') {
                calendar.setOption('viewDidMount', ensureHeaderVisibility);
                calendar.setOption('datesSet', ensureHeaderVisibility);
            }
        } catch (e) {
            console.log('カレンダーイベントリスナーの設定中にエラーが発生しました:', e);
        }
    }

    // Additionally, add a mutation observer to detect DOM changes that might affect visibility
    const observeHeaderChanges = () => {
        const headerToolbar = document.querySelector('.fc-header-toolbar');
        if (headerToolbar) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'style' ||
                            mutation.attributeName === 'class')) {
                        ensureHeaderVisibility();
                    }
                });
            });

            observer.observe(headerToolbar, {
                attributes: true,
                subtree: true,
                childList: true
            });
        }
    };

    // Start observing after calendar is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a short delay to ensure calendar is rendered
        setTimeout(() => {
            observeHeaderChanges();
            ensureHeaderVisibility();

            // 直接カレンダービューの変更イベントをドキュメントレベルで監視
            document.addEventListener('click', function(e) {
                // ツールバーボタンがクリックされた場合
                if (e.target.closest('.fc-button')) {
                    // ボタンクリック後にヘッダーの可視性を確認
                    setTimeout(ensureHeaderVisibility, 100);
                }
            });
        }, 1000);
    });
});