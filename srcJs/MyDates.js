const offset = new Date().getTimezoneOffset() / 60;

class MyDates {
    static configureLocale(i18n, masks) {
        i18n.dayNames = [
            "Dom",
            "Lun",
            "Mar",
            "Mié",
            "Jue",
            "Vie",
            "Sab",
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
        ];

        i18n.monthNames = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ];

        i18n.timeNames = ["a", "p", "am", "pm", "A", "P", "AM", "PM"];

        masks.opcion1 = 'dddd, mmmm d, yyyy';
        masks.opcion2 = 'dddd, mmmm d';

        masks.simple1 = 'ddd d mmm, yyyy';
        masks.simple2 = 'ddd d mmm';

        masks.opcion3 = 'h:MM TT'
    }
    static formatDateBasic(dateformat, now, ...args) {
        if (now instanceof Date) {
            if (new Date().getFullYear() == now.getFullYear()) {
                return dateformat(now, "opcion2");
            } else {
                return dateformat(now, "opcion1");
            }
        } else {
            return "Día / Mes / Año";
        }
    }
    static formatDateSimpleBasic(dateformat, now, ...args) {
        if (now instanceof Date) {
            if (new Date().getFullYear() == now.getFullYear()) {
                return dateformat(now, "simple2");
            } else {
                return dateformat(now, "simple1");
            }
        } else {
            return "Día / Mes / Año";
        }
    }
    static formatTimeBasic(dateformat, now, ...args) {
        if (now instanceof Date) {
            return dateformat(now, "opcion3");
        } else {
            return "Hora / Minuto";
        }
    }
    static createDuration(dias = 0, horas = 0, minutos = 0) {
        const actual = new Date(1970, 0, dias + 1, horas - offset, minutos).getTime();
        return actual;
    }
    static getDaysFromDuration(epoch) {
        return new Date(epoch).getUTCDate() - 1;
    }
    static getHoursFromDuration(epoch) {
        return new Date(epoch).getUTCHours();
    }
    static getMinutesFromDuration(epoch) {
        return new Date(epoch).getUTCMinutes();
    }
    static getDayAsContinuosNumber(fecha) {
        const anio = fecha.getUTCFullYear();
        const mes = fecha.getUTCMonth() + 1;
        const dia = fecha.getUTCDate();
        return dia + 100 * mes + anio * 10000;
    }
    static getDayAsContinuosNumberHmmSSmmm(fecha) {
        const anio = fecha.getUTCFullYear();
        const mes = fecha.getUTCMonth() + 1;
        const dia = fecha.getUTCDate();
        const horas = fecha.getUTCHours();//00
        const minutos = fecha.getUTCMinutes();//00
        const segundos = fecha.getUTCSeconds();//00
        const milisegundos = fecha.getUTCMilliseconds();//000
        return milisegundos + 1000 * segundos + minutos * 100000 + horas * 10000000 + dia * 1000000000 + 100000000000 * mes + anio * 10000000000000;
    }
    static isToday(someDate) {
        const fecha = new Date(someDate);
        const ahora = new Date();
        const anio0 = ahora.getFullYear();
        const mes0 = ahora.getMonth();
        const dia0 = ahora.getDate();

        const isToday = (fecha.getFullYear() == anio0 && fecha.getMonth() == mes0 && fecha.getDate() == dia0);
        return isToday;
    }

    static lPad2(n) {
        return ('0' + n).slice(-2);
    }

    static listGenerator(min, max, pad = false) {
        const response = [];
        if (!pad) {
            for (let i = min; i <= max; i++) {
                response.push({ label: "" + i, value: "" + i })
            }
        } else {
            for (let i = min; i <= max; i++) {
                response.push({ label: MyDates.lPad2(i), value: "" + i })
            }
        }
        return response;
    }

    static toAAAAMMDD(siguiente) {
        const anio1 = siguiente.getFullYear();
        const mes1 = siguiente.getMonth();
        const dia1 = siguiente.getDate();
        return anio1 + MyDates.lPad2(mes1) + MyDates.lPad2(dia1);
    }
}

module.exports = {
    MyDates
};