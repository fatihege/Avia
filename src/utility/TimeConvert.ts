import LanguageManager from '../language/LanguageManager';
import TimeUnits from '../interfaces/TimeUnits';

const TimeUnitMS = {
    year: 31536000000,
    month: 2592000000,
    week: 604800000,
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000
}

export default (
    language: string = LanguageManager.DEFAULT_LANGUAGE,
    ms: number,
    chunk: number = 5
): TimeUnits => {
    const result: TimeUnits = {
        year: 0,
        month: 0,
        week: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
    };

    Object.keys(TimeUnitMS).forEach((key) => {
        result[key] = Math.floor(ms / TimeUnitMS[key]);
        ms -= result[key] * TimeUnitMS[key];
    });

    return Object.assign(result, {
        toString(): string {
            let arr = []
            if(result.year !== 0) arr.push(`${result.year} ${LanguageManager.translate(language, 'global.date.time.year')}`);
            if(result.month !== 0) arr.push(`${result.month} ${LanguageManager.translate(language, 'global.date.time.month')}`);
            if(result.week !== 0) arr.push(`${result.week} ${LanguageManager.translate(language, 'global.date.time.week')}`);
            if(result.day !== 0) arr.push(`${result.day} ${LanguageManager.translate(language, 'global.date.time.day')}`);
            if(result.hour !== 0) arr.push(`${result.hour} ${LanguageManager.translate(language, 'global.date.time.hour')}`);
            if(result.minute !== 0) arr.push(`${result.minute} ${LanguageManager.translate(language, 'global.date.time.minute')}`);
            if(result.second !== 0) arr.push(`${result.second} ${LanguageManager.translate(language, 'global.date.time.second')}`);

            return arr.slice(0, chunk).join(' ');
        }
    });
}