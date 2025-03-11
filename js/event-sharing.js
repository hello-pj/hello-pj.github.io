// First, let's add the share button to HTML elements (calendar-ui.js)

// X投稿用のグループ名変換マッピング
const xGroupNameMapping = {
    "HELLO! PROJECT": "HelloProject",
    "モーニング娘。'25": "モーニング娘25",
    "アンジュルム": "アンジュルム",
    "Juice=Juice": "juicejuice",
    "つばきファクトリー": "つばきファクトリー",
    "BEYOOOOONDS": "BEYOOOOONDS",
    "OCHA NORMA": "ocha_norma",
    "ロージークロニクル": "ロージークロニクル",
    "ハロプロ研修生": "ハロプロ研修生"
};

// X投稿用にグループ名を変換する関数
function convertGroupNameForX(groupName) {
    return xGroupNameMapping[groupName] || groupName;
}

// 1. Function to create a share button
function createShareButton(callback) {
    var shareBtn = document.createElement('button');
    shareBtn.className = 'share-button';
    shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> シェア';
    shareBtn.style.backgroundColor = '#0073e6';
    shareBtn.style.color = 'white';
    shareBtn.style.border = 'none';
    shareBtn.style.borderRadius = '4px';
    shareBtn.style.padding = '8px 12px';
    shareBtn.style.margin = '10px 0';
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.display = 'flex';
    shareBtn.style.alignItems = 'center';
    shareBtn.style.justifyContent = 'center';
    shareBtn.style.gap = '5px';
    shareBtn.style.fontSize = '14px';
    shareBtn.style.width = 'fit-content';
    shareBtn.style.whiteSpace = 'nowrap'; // テキストが折り返さないようにする
    shareBtn.style.minWidth = 'min-content'; // 追加: 内容の最小幅より小さくならないようにする

    shareBtn.addEventListener('click', callback);

    return shareBtn;
}

// 1.2 Function to create an X (Twitter) share button
function createXShareButton(callback) {
    var xShareBtn = document.createElement('button');
    xShareBtn.className = 'share-button x-share-button';
    // X (Twitter) logo
    xShareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> 投稿';
    xShareBtn.style.backgroundColor = '#000000';
    xShareBtn.style.color = 'white';
    xShareBtn.style.border = 'none';
    xShareBtn.style.borderRadius = '4px';
    xShareBtn.style.padding = '8px 12px';
    xShareBtn.style.margin = '10px 5px';
    xShareBtn.style.cursor = 'pointer';
    xShareBtn.style.display = 'flex';
    xShareBtn.style.alignItems = 'center';
    xShareBtn.style.justifyContent = 'center';
    xShareBtn.style.gap = '5px';
    xShareBtn.style.fontSize = '14px';
    xShareBtn.style.width = 'fit-content';
    xShareBtn.style.whiteSpace = 'nowrap'; // テキストが折り返さないようにする
    xShareBtn.style.minWidth = 'min-content'; // 追加: 内容の最小幅より小さくならないようにする

    xShareBtn.addEventListener('click', callback);

    return xShareBtn;
}

// 2. Function to format an event for sharing
function formatEventForSharing(event, formattedDate) {
    let eventInfo = `${formattedDate}\n`;

    // Get group information
    let groupValue = '';
    if (event.extendedProps && event.extendedProps.group) {
        groupValue = event.extendedProps.group;
    } else if (event.group) {
        groupValue = event.group;
    }

    // Get time information
    let timeInfo = '';
    if (event.allDay) {
        timeInfo = '終日';
    } else {
        let timeStr = '';
        if (typeof event.start === 'string' && event.start.indexOf('T') > -1) {
            // ISO string
            const timeParts = event.start.split('T')[1].split(':');
            const hours = (parseInt(timeParts[0], 10) + 9) % 24; // JST adjustment
            timeStr = String(hours).padStart(2, '0') + ':' + timeParts[1];
        } else if (event.start instanceof Date) {
            // Date object
            timeStr = String(event.start.getHours()).padStart(2, '0') + ':' +
                String(event.start.getMinutes()).padStart(2, '0');
        } else if (typeof event.start === 'object' && event.start && typeof event.start.toDate === 'function') {
            // FullCalendar date object
            const date = event.start.toDate();
            timeStr = String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0');
        }
        timeInfo = timeStr;
    }

    // Add event title
    eventInfo += `【${event.title}】\n`;

    // Add group
    if (groupValue) {
        eventInfo += `グループ: ${groupValue}\n`;
    }

    // Add time
    eventInfo += `時間: ${timeInfo}\n`;

    // Add location if available
    let locationText = '';
    if (event.extendedProps && event.extendedProps.location) {
        locationText = event.extendedProps.location;
    } else if (event.location) {
        locationText = event.location;
    }

    if (locationText && !event.allDay) {
        eventInfo += `場所: ${locationText}\n`;
    }

    // Add description if available
    let descriptionText = '';
    if (event.extendedProps && event.extendedProps.description) {
        descriptionText = event.extendedProps.description;
    } else if (event.description) {
        descriptionText = event.description;
    }

    if (descriptionText) {
        // Check if it's a URL
        const urlRegex = /^https?:\/\/[^\s]+$/;
        if (urlRegex.test(descriptionText.trim())) {
            eventInfo += `詳細: ${descriptionText}\n`;
        } else if (!event.allDay && descriptionText.includes('T') &&
            (descriptionText.includes('Z') || descriptionText.includes('+'))) {
            // If it looks like a time string
            try {
                const timeDate = new Date(descriptionText);
                if (!isNaN(timeDate.getTime())) {
                    let hours = timeDate.getUTCHours() + 9;
                    if (hours >= 24) hours -= 24;
                    const minutes = timeDate.getUTCMinutes();
                    const formattedTime = String(hours).padStart(2, '0') + ':' +
                        String(minutes).padStart(2, '0');
                    eventInfo += `開場: ${formattedTime}\n`;
                } else {
                    eventInfo += `説明: ${descriptionText}\n`;
                }
            } catch (e) {
                eventInfo += `説明: ${descriptionText}\n`;
            }
        } else {
            eventInfo += `説明: ${descriptionText}\n`;
        }
    }

    // Add app information
    eventInfo += `\n#ハロプロイベントカレンダー\nhttps://hello-pj.github.io/calendar`;

    return eventInfo;
}

// 2.2 Format events for X (Twitter) sharing
function formatEventsForXSharing(date, events) {
    // 曜日の配列
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    // 日付のフォーマット
    const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;

    // 投稿のベーステキスト
    let xText = `【ハロプロイベント情報】\n${formattedDate}\n`;

    // イベントを名前でグループ化（同じイベント名は一度だけ表示）
    const uniqueEvents = new Map(); // イベント名をキーにして、関連グループを配列で保持

    events.forEach(event => {
        // イベント名を取得
        const eventTitle = event.title;

        // グループ名を取得
        let groupName = '';
        if (event.extendedProps && event.extendedProps.group) {
            groupName = event.extendedProps.group;
        } else if (event.group) {
            groupName = event.group;
        }

        // X用のグループ名変換
        const xGroupName = convertGroupNameForX(groupName);

        // 既存のエントリを取得するか、新しいエントリを作成
        if (!uniqueEvents.has(eventTitle)) {
            uniqueEvents.set(eventTitle, [xGroupName]);
        } else {
            // 同じグループが重複しないようにチェック
            const groups = uniqueEvents.get(eventTitle);
            if (!groups.includes(xGroupName)) {
                groups.push(xGroupName);
            }
        }
    });

    // 各ユニークイベントを表示
    uniqueEvents.forEach((groups, eventTitle) => {
        // イベント名を追加
        xText += `✨${eventTitle}\n`;

        // 関連するグループをハッシュタグ付きで追加
        groups.forEach(group => {
            // 「HELLO! PROJECT」はスキップ（全体イベントの場合は個別グループだけ表示）
            if (group.toLowerCase() !== 'helloproject') {
                xText += `#${group}\n`;
            }
        });
    });

    // フッター部分
    let footer = `\n📅詳細を✅️\nhttps://hello-pj.github.io/calendar`;

    // 最後に #ハロプロ タグを追加
    footer += `\n#ハロプロ`;

    // Twitter文字数制限を考慮 (280文字)
    // 現在のテキスト + フッターの長さを計算
    if ((xText + footer).length > 280) {
        // 文字数オーバーする場合はフッターを短縮
        return xText + `\n📅詳細を✅️\nhttps://hello-pj.github.io/calendar`;
    } else {
        return xText + footer;
    }
}
// 3. Function to share a single event
function shareEvent(event, displayDate) {
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: event.title,
            text: formatEventForSharing(event, displayDate)
        }).catch(error => {
            console.error('Error sharing:', error);
            // Fallback for sharing error
            fallbackShare(formatEventForSharing(event, displayDate));
        });
    } else {
        // Fallback method
        fallbackShare(formatEventForSharing(event, displayDate));
    }
}

// 4. Function to share multiple events on a day
function shareDayEvents(date, events) {
    // Format the date
    const formattedDate = date.getFullYear() + '年' +
        (date.getMonth() + 1) + '月' +
        date.getDate() + '日 (' +
        CalendarUI.weekdayNames[date.getDay()] + ')';

    let shareText = `${formattedDate}のイベント\n\n`;

    if (events.length === 0) {
        shareText += 'この日のイベントはありません。';
    } else {
        events.forEach((event, index) => {
            // Basic event info
            if (index > 0) {
                shareText += '\n\n-------------------\n\n';
            }

            // Format each event
            shareText += formatEventForSharing(event, formattedDate).split('\n').slice(1).join('\n');
        });
    }

    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: `${formattedDate}のイベント`,
            text: shareText
        }).catch(error => {
            console.error('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        // Fallback method
        fallbackShare(shareText);
    }
}

// 4.2 Function to share events to X (Twitter)
function shareEventsToX(date, events) {
    // Format the text for X
    const xShareText = formatEventsForXSharing(date, events);

    // Encode for URL
    const encodedText = encodeURIComponent(xShareText);

    // Open Twitter intent URL
    const xURL = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(xURL, '_blank');
}

// 5. Fallback sharing method
function fallbackShare(text) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    // Select and copy the text
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('テキストがコピーされました。お好みのアプリで貼り付けてシェアしてください。');
        } else {
            showToast('コピーに失敗しました。');
        }
    } catch (err) {
        console.error('Fallback sharing failed', err);
        showToast('シェアに失敗しました。');
    }

    document.body.removeChild(textarea);
}

// 6. Toast notification function
function showToast(message) {
    // Check if toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '80px'; // Above ad banner
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translateX(-50%)';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.fontSize = '14px';
    toast.style.textAlign = 'center';
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '80vw';

    // Add to container
    toastContainer.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }

            // Remove container if empty
            if (toastContainer.children.length === 0) {
                document.body.removeChild(toastContainer);
            }
        }, 500);
    }, 3000);
}

// Export functions to make them available
window.EventSharing = {
    createShareButton,
    createXShareButton,
    formatEventForSharing,
    formatEventsForXSharing,
    shareEvent,
    shareDayEvents,
    shareEventsToX,
    fallbackShare,
    showToast
};