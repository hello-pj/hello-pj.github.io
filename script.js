document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var eventTitle = document.getElementById('event-title');
  var eventDate = document.getElementById('event-date');
  var eventLocation = document.getElementById('event-location');
  var eventDescription = document.getElementById('event-description');
  var eventGroup = document.getElementById('event-group');
  var eventImage = document.getElementById('event-image'); // 画像要素を取得

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
            title: event.Subject,
            start: event['Start Date'] + "T" + event['Start Time'],
            location: event.Location,
            description: event.Description,
            group: event.Group
          };
        });
      });
  }

  fetchEventData().then(events => {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'ja', // 日本語に設定
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      eventTimeFormat: { // 時間表示形式を統一
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false // 24時間表示に設定
      },
      events: events.map(event => {
        // グループごとにイベントの色を設定
        var groupColors = {
          "モーニング娘。'25": "#E80112",
          "アンジュルム": "#106DB7",
          "Juice=Juice": "#611A85",
          "つばきファクトリー": "#F29EC2",
          "BEYOOOOONDS": "#249849",
          "ロージークロニクル": "#FFD629",
          "ハロプロ研修生": "#33D6AD",
          "HELLO! PROJECT": "#0175C2",
          "OCHA NORMA": "#F39800"
        };
        return {
          ...event,
          color: groupColors[event.group] || '#000000' // デフォルト色は黒
        };
      }),
      eventClick: function(info) {
        eventTitle.textContent = info.event.title;
        eventDate.textContent = info.event.start.toISOString().split('T')[0];
        eventLocation.textContent = info.event.extendedProps.location;
        eventDescription.textContent = info.event.extendedProps.description;
        eventGroup.textContent = info.event.extendedProps.group;

        // グループごとに画像を変更
        var groupImages = {
          "モーニング娘。'25": "img/morning_musume_image.jpg",
          "アンジュルム": "img/angerme_image.jpg",
          "Juice=Juice": "img/juice_juice_image.jpg",
          "つばきファクトリー": "img/tsubaki_factory_image.jpg",
          "BEYOOOOONDS": "img/beyooooonds_image.jpg",
          "ロージークロニクル": "img/rouge_chronicle_image.jpg",
          "ハロプロ研修生": "img/hello_project_trainees_image.jpg",
          "HELLO! PROJECT": "img/hello_project_image.jpg",
          "OCHA NORMA": "img/ocha_norma_image.jpg" // OCHA NORMAを追加
        };

        var imageUrl = groupImages[info.event.extendedProps.group];
        if (imageUrl) {
          eventImage.src = imageUrl;
        } else {
          eventImage.src = 'img/default_image.jpg'; // デフォルト画像
        }
      }
    });
    calendar.render();
  });
});
