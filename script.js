document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var groupFiltersContainer = document.getElementById('group-filters');
  var eventDetails = document.getElementById('event-details');
  var overlay = document.getElementById('overlay');
  var closeButton = document.getElementById('close-details');

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

  var activeGroups = new Set(Object.keys(groupColors));

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
    events.filter(event => activeGroups.has(event.group)).forEach(event => {
      calendar.addEvent(event);
    });
  }

  fetchEventData().then(events => {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'ja',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      },
      events: events,
      eventClick: function(info) {
        document.getElementById('event-title').textContent = info.event.title;
        document.getElementById('event-date').textContent = info.event.start.toISOString().split('T')[0];
        document.getElementById('event-location').textContent = info.event.extendedProps.location;
        document.getElementById('event-description').textContent = info.event.extendedProps.description;
        document.getElementById('event-group').textContent = info.event.extendedProps.group;
        document.getElementById('event-image').src = 'img/default_image.jpg';

        if (window.innerWidth <= 768) {
          eventDetails.classList.add('show');
          overlay.style.display = 'block';
        }
      }
    });
    calendar.render();

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

  // 詳細パネルを閉じる処理
  function closeEventDetails() {
    eventDetails.classList.remove('show');
    overlay.style.display = 'none';
  }

  closeButton.addEventListener('click', closeEventDetails);
  overlay.addEventListener('click', closeEventDetails);

  // 下方向にスワイプで閉じる（スクロールを考慮）
  let touchStartY = 0;
  let touchEndY = 0;

  eventDetails.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
  });

  eventDetails.addEventListener('touchmove', function(event) {
    touchEndY = event.touches[0].clientY;
  });

  eventDetails.addEventListener('touchend', function() {
    let scrollPosition = eventDetails.scrollTop;
    let maxScroll = eventDetails.scrollHeight - eventDetails.clientHeight;

    if (scrollPosition >= maxScroll && touchEndY - touchStartY > 50) {
      closeEventDetails();
    }
  });
});
