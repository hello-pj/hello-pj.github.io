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
      .then(response => response.json())
      .then(events => {
        return events.map(event => {
          let utcDate = new Date(event['Start Date']);
          let jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
          event['Start Date'] = jstDate.toISOString().split('T')[0];
          event['Start Time'] = event['Start Time'].split('T')[1];
          return {
            id: event.Id,
            title: event.Subject,
            start: event['Start Date'] + "T" + event['Start Time'],
            location: event.Location,
            description: event.Description,
            group: event.Group,
            color: groupColors[event.Group] || '#000000'
          };
        });
      });
  }

  function updateCalendarEvents(calendar, events) {
    calendar.removeAllEvents();
    let filteredEvents = events.filter(event => activeGroups.has(event.group));
    filteredEvents.forEach(event => {
      calendar.addEvent(event);
    });
  }

  // 全イベントにモバイルスタイルを適用または解除する関数
  function updateAllEventStyles() {
    let newIsMobile = window.innerWidth <= 768;
    
    // モバイル状態が変わった場合のみ処理
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      
      // 現在の表示を保存
      let currentDate = calendar ? calendar.getDate() : new Date();
      let currentView = calendar && calendar.view ? calendar.view.type : 'dayGridMonth';
      let scrollPosition = window.scrollY;
      
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
      events: events.filter(event => activeGroups.has(event.group)),
      // モバイルモードか PC モードに応じてイベント表示をカスタマイズ
      eventContent: function(arg) {
        // モバイルモードかつ月表示の場合
        if (isMobile && arg.view.type === 'dayGridMonth') {
          let eventGroup = arg.event.extendedProps.group;
          let eventColor = groupColors[eventGroup] || '#000000';
          
          // カスタム表示のためのコンテナを作成
          let container = document.createElement('div');
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
          
          return { domNodes: [container] };
        } 
        // PCモードの月表示の場合
        else if (!isMobile && arg.view.type === 'dayGridMonth') {
          let eventGroup = arg.event.extendedProps.group;
          let eventColor = groupColors[eventGroup] || '#000000';
          
          // カスタムHTMLを返す
          return {
            html: `
              <div style="display: flex; align-items: center; width: 100%; overflow: hidden;">
                <div style="min-width: 8px; min-height: 8px; width: 8px; height: 8px; border-radius: 50%; background-color: ${eventColor}; margin-right: 4px; flex-shrink: 0;"></div>
                <div class="fc-event-time" style="margin-right: 4px; white-space: nowrap; flex-shrink: 0;">${arg.timeText}</div>
                <div class="fc-event-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${arg.event.title}</div>
              </div>
            `
          };
        }
        // 他のビュー（週表示、日表示）の場合はデフォルト表示を使用
        return {
          html: `
            <div class="fc-event-time">${arg.timeText}</div>
            <div class="fc-event-title">${arg.event.title}</div>
          `
        };
      },
      eventClick: function(info) {
        eventTitle.textContent = info.event.title;
        eventDate.textContent = info.event.start.toISOString().split('T')[0];
        eventLocation.textContent = info.event.extendedProps.location;
        eventDescription.textContent = info.event.extendedProps.description;
        eventGroup.textContent = info.event.extendedProps.group;
        eventImage.src = groupImages[info.event.extendedProps.group] || 'img/default_image.jpg';

        if (window.innerWidth <= 768) {
          eventDetails.classList.add('show');
          overlay.style.display = 'block'; // オーバーレイを表示
        }
      },
      views: {
        // 週表示のカスタマイズ
        timeGridWeek: {
          // 週表示のときのタイトルフォーマットをカスタマイズ
          titleFormat: { year: 'numeric', month: 'long' },
          // カスタムの日付ヘッダー内容
          dayHeaderContent: function(args) {
            const weekday = weekdayNames[args.date.getDay()];
            const day = args.date.getDate();
            
            // 曜日と日付を含むHTMLを返す
            return {
              html: `<div style="display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 0.8em; color: #666;">${weekday}</div>
                      <div style="font-size: 1.2em; font-weight: bold;">${day}</div>
                    </div>`
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
            const weekday = weekdayNames[args.date.getDay()];
            const day = args.date.getDate();
            
            // 曜日と日付を含むHTMLを返す
            return {
              html: `<div style="display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 0.8em; color: #666;">${weekday}</div>
                      <div style="font-size: 1.2em; font-weight: bold;">${day}</div>
                    </div>`
            };
          }
        }
      }
    });
    
    calendar.render();
  }

  fetchEventData().then(events => {
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

    Object.keys(groupColors).forEach(group => {
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

  document.getElementById('close-details').addEventListener('click', function() {
    eventDetails.classList.remove('show');
    overlay.style.display = 'none'; // オーバーレイを非表示
  });

  overlay.addEventListener('click', function() {
    eventDetails.classList.remove('show');
    overlay.style.display = 'none'; // オーバーレイを非表示
  });
  
  // デバウンス関数（ウィンドウリサイズイベントの連続発火を防止）
  function debounce(func, wait) {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  }
  
  // ウィンドウサイズの変更を検知して、カレンダーの表示を更新（デバウンス処理付き）
  window.addEventListener('resize', debounce(function() {
    updateAllEventStyles();
  }, 250));

  // タッチイベントの追加
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
      overlay.style.display = 'none'; // オーバーレイを非表示
    }
  });
});
