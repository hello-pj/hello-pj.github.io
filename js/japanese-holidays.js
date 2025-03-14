// js/japanese-holidays.js
// 日本の祝日を計算で判定する機能

var JapaneseHolidays = (function() {
    // ハッピーマンデー制度対象の祝日（月曜日に固定されている祝日）
    const happyMondays = {
        1: { week: 2, name: '成人の日' }, // 1月第2月曜
        7: { week: 3, name: '海の日' }, // 7月第3月曜
        9: { week: 3, name: '敬老の日' }, // 9月第3月曜 
        10: { week: 2, name: 'スポーツの日' } // 10月第2月曜
    };

    // 固定日付の祝日
    const fixedHolidays = {
        '1-1': '元日',
        '2-11': '建国記念の日',
        '2-23': '天皇誕生日',
        '4-29': '昭和の日',
        '5-3': '憲法記念日',
        '5-4': 'みどりの日',
        '5-5': 'こどもの日',
        '8-11': '山の日',
        '11-3': '文化の日',
        '11-23': '勤労感謝の日'
    };

    // 春分・秋分の日付（2021-2030年）
    const equinoxDays = {
        // 春分（3月）
        2024: { spring: 20, autumn: 22 },
        2025: { spring: 20, autumn: 23 },
        2026: { spring: 20, autumn: 23 },
        2027: { spring: 21, autumn: 23 },
        2028: { spring: 20, autumn: 22 },
        2029: { spring: 20, autumn: 23 },
        2030: { spring: 20, autumn: 23 },
        2031: { spring: 21, autumn: 23 },
        2032: { spring: 20, autumn: 22 },
        2033: { spring: 20, autumn: 23 },
        2034: { spring: 20, autumn: 23 }
    };

    // 振替休日を計算
    function isSubstituteHoliday(date) {
        // 月曜日であることを確認
        if (date.getDay() !== 1) return false;

        // 前日（日曜日）が祝日かチェック
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);
        return isFixedHoliday(prevDate) || isEquinoxDay(prevDate) || isHappyMonday(prevDate);
    }

    // 固定祝日かチェック
    function isFixedHoliday(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${month}-${day}`;
        return fixedHolidays[key] !== undefined;
    }

    // ハッピーマンデーかチェック
    function isHappyMonday(date) {
        if (date.getDay() !== 1) return false; // 月曜日でない場合はfalse

        const month = date.getMonth() + 1;
        if (!happyMondays[month]) return false;

        // 第n月曜日を計算
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let firstMonday = 1 + (8 - firstDay.getDay()) % 7; // 月の最初の月曜日
        const week = happyMondays[month].week;
        const nthMonday = firstMonday + (week - 1) * 7;

        return date.getDate() === nthMonday;
    }

    // 春分・秋分の日かチェック
    function isEquinoxDay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // 春分の日（3月）
        if (month === 3 && equinoxDays[year] && day === equinoxDays[year].spring) {
            return true;
        }

        // 秋分の日（9月）
        if (month === 9 && equinoxDays[year] && day === equinoxDays[year].autumn) {
            return true;
        }

        return false;
    }

    // 指定した日付が祝日かどうかを判定
    function isHoliday(date) {
        // 固定祝日
        if (isFixedHoliday(date)) return true;

        // ハッピーマンデー
        if (isHappyMonday(date)) return true;

        // 春分・秋分の日
        if (isEquinoxDay(date)) return true;

        // 振替休日
        if (isSubstituteHoliday(date)) return true;

        return false;
    }

    // 祝日の名前を取得
    function getHolidayName(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${month}-${day}`;

        // 固定祝日
        if (fixedHolidays[key]) {
            return fixedHolidays[key];
        }

        // ハッピーマンデー
        if (date.getDay() === 1 && happyMondays[month]) {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            let firstMonday = 1 + (8 - firstDay.getDay()) % 7;
            const week = happyMondays[month].week;
            const nthMonday = firstMonday + (week - 1) * 7;

            if (date.getDate() === nthMonday) {
                return happyMondays[month].name;
            }
        }

        // 春分・秋分の日
        const year = date.getFullYear();
        if (month === 3 && equinoxDays[year] && day === equinoxDays[year].spring) {
            return '春分の日';
        }
        if (month === 9 && equinoxDays[year] && day === equinoxDays[year].autumn) {
            return '秋分の日';
        }

        // 振替休日
        if (isSubstituteHoliday(date)) {
            return '振替休日';
        }

        return '';
    }

    // 公開API
    return {
        isHoliday: isHoliday,
        getHolidayName: getHolidayName
    };
})();