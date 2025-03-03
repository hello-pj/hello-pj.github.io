// Data handling module for calendar events
var CalendarData = (function() {
    // Group colors for different Hello Project groups
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

    // Group images
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

    // Set of active groups for filtering
    var activeGroups = new Set(Object.keys(groupColors));

    // Fetch event data from Google Sheets API
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

    // Return public API
    return {
        groupColors: groupColors,
        groupImages: groupImages,
        activeGroups: activeGroups,
        fetchEventData: fetchEventData
    };
})();