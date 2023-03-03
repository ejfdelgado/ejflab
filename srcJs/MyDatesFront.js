const dateformat = require('dateformat');
const { MyDates } = require('./MyDates.js');

MyDates.configureLocale(dateformat.i18n, dateformat.masks);
class MyDatesFront extends MyDates {
    static formatDate(now, ...args) {
        return MyDates.formatDateBasic(dateformat.default, now, args);
    }
    static formatDateCompleto(now, ...args) {
        return MyDates.formatDateCompletoBasic(dateformat.default, now, args);
    }
    static formatDateSimple(now, ...args) {
        return MyDates.formatDateSimpleBasic(dateformat.default, now, args);
    }
    static formatTime(now, ...args) {
        return MyDates.formatTimeBasic(dateformat.default, now, args);
    }
}

module.exports = {
    MyDatesFront
};