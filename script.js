document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var eventTitle = document.getElementById('event-title');
  var eventDate = document.getElementById('event-date');
  var eventLocation = document.getElementById('event-location');
  var eventDescription = document.getElementById('event-description');
  var eventGroup = document.getElementById('event-group');
  var eventImage = document.getElementById('event-image');
  var groupFiltersContainer = document.getElementById('group-filters');

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
        eventTitle.textContent = info.event.title;
        eventDate.textContent = info.event.start.toISOString().split('T')[0];
        eventLocation.textContent = info.event.extendedProps.location;
        eventDescription.textContent = info.event.extendedProps.description;
        eventGroup.textContent = info.event.extendedProps.group;
        eventImage.src = groupImages[info.event.extendedProps.group] || 'img/default_image.jpg';
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
});
