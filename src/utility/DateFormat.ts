import Server from '../structures/Server';
import LanguageManager from '../language/LanguageManager';

export default (date: Date, server: Server | null = null) => {
    const months = server ? server.translate('global.date.months').split('\n') :
        LanguageManager.translate(LanguageManager.DEFAULT_LANGUAGE, 'global.date.months').split('\n');
    const days = server ? server.translate('global.date.days').split('\n') :
        LanguageManager.translate(LanguageManager.DEFAULT_LANGUAGE, 'global.date.days').split('\n');

    const year = date.getFullYear();
    const month = date.getMonth();
    const monthday = date.getDate();
    const weekday = date.getDay();
    const hour = addZero(date.getHours());
    const minute = addZero(date.getMinutes());

    return `${monthday} ${months[month]} ${year} ${days[weekday]} ${hour}:${minute}`;
}

const addZero = (num: number): string => num < 10 ? `0${num}` : num.toString();

