
const offset = new Date().getTimezoneOffset() / 60;

class MyDates {
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

    static getRemainingHoursCountDown(epochTxt) {
        const AHORA = new Date().getTime();
        const epoch = parseInt(epochTxt);
        if (isNaN(epoch)) {
            return "? Horas";
        } else {
            let segDiff = parseInt((epoch / 1000) - (AHORA / 1000));
            let prefix = "";
            if (segDiff < 0) {
                prefix = "-";
                segDiff *= -1;
            }
            let minutos = Math.floor(segDiff / 60);
            const segundos = segDiff - minutos * 60;
            let horas = Math.floor(minutos / 60);
            minutos = minutos - horas * 60;

            if (prefix == "-") {
                return "0h 0m 0s";
            }

            return prefix + MyDates.lPad2(horas) + "h " + MyDates.lPad2(minutos) + "m " + MyDates.lPad2(segundos) + "s";
        }
    }

    static get48MinMaxDonationRange(EXPIRATION_HOURS) {
        const ahoraDate = new Date();
        const ahoraEpoch = ahoraDate.getTime();
        let numero = parseInt(EXPIRATION_HOURS);
        if (isNaN(numero)) {
            numero = 48;
        }
        const minDate = new Date(new Date(ahoraEpoch).setHours(ahoraDate.getHours() + numero));
        const actual = new Date(new Date(ahoraEpoch).setHours(ahoraDate.getHours() + numero + 1));
        const maxDate = new Date(new Date(ahoraEpoch).setMonth(ahoraDate.getMonth() + 1));
        return { minDate, maxDate, actual };
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

    static getAllHours() {
        return [
            { label: "12:00 am", value: "" + (0) },
            { label: "12:15 am", value: "" + (15) },
            { label: "12:30 am", value: "" + (30) },
            { label: "12:45 am", value: "" + (45) },

            { label: "01:00 am", value: "" + (1 * 60 + 0) },
            { label: "01:15 am", value: "" + (1 * 60 + 15) },
            { label: "01:30 am", value: "" + (1 * 60 + 30) },
            { label: "01:45 am", value: "" + (1 * 60 + 45) },

            { label: "02:00 am", value: "" + (2 * 60 + 0) },
            { label: "02:15 am", value: "" + (2 * 60 + 15) },
            { label: "02:30 am", value: "" + (2 * 60 + 30) },
            { label: "02:45 am", value: "" + (2 * 60 + 45) },

            { label: "03:00 am", value: "" + (3 * 60 + 0) },
            { label: "03:15 am", value: "" + (3 * 60 + 15) },
            { label: "03:30 am", value: "" + (3 * 60 + 30) },
            { label: "03:45 am", value: "" + (3 * 60 + 45) },

            { label: "04:00 am", value: "" + (4 * 60 + 0) },
            { label: "04:15 am", value: "" + (4 * 60 + 15) },
            { label: "04:30 am", value: "" + (4 * 60 + 30) },
            { label: "04:45 am", value: "" + (4 * 60 + 45) },

            { label: "05:00 am", value: "" + (5 * 60 + 0) },
            { label: "05:15 am", value: "" + (5 * 60 + 15) },
            { label: "05:30 am", value: "" + (5 * 60 + 30) },
            { label: "05:45 am", value: "" + (5 * 60 + 45) },

            { label: "06:00 am", value: "" + (6 * 60 + 0) },
            { label: "06:15 am", value: "" + (6 * 60 + 15) },
            { label: "06:30 am", value: "" + (6 * 60 + 30) },
            { label: "06:45 am", value: "" + (6 * 60 + 45) },

            { label: "07:00 am", value: "" + (7 * 60 + 0) },
            { label: "07:15 am", value: "" + (7 * 60 + 15) },
            { label: "07:30 am", value: "" + (7 * 60 + 30) },
            { label: "07:45 am", value: "" + (7 * 60 + 45) },

            { label: "08:00 am", value: "" + (8 * 60 + 0) },
            { label: "08:15 am", value: "" + (8 * 60 + 15) },
            { label: "08:30 am", value: "" + (8 * 60 + 30) },
            { label: "08:45 am", value: "" + (8 * 60 + 45) },

            { label: "09:00 am", value: "" + (9 * 60 + 0) },
            { label: "09:15 am", value: "" + (9 * 60 + 15) },
            { label: "09:30 am", value: "" + (9 * 60 + 30) },
            { label: "09:45 am", value: "" + (9 * 60 + 45) },

            { label: "10:00 am", value: "" + (10 * 60 + 0) },
            { label: "10:15 am", value: "" + (10 * 60 + 15) },
            { label: "10:30 am", value: "" + (10 * 60 + 30) },
            { label: "10:45 am", value: "" + (10 * 60 + 45) },

            { label: "11:00 am", value: "" + (11 * 60 + 0) },
            { label: "11:15 am", value: "" + (11 * 60 + 15) },
            { label: "11:30 am", value: "" + (11 * 60 + 30) },
            { label: "11:45 am", value: "" + (11 * 60 + 45) },

            { label: "12:00 pm", value: "" + (12 * 60 + 0) },
            { label: "12:15 pm", value: "" + (12 * 60 + 15) },
            { label: "12:30 pm", value: "" + (12 * 60 + 30) },
            { label: "12:45 pm", value: "" + (12 * 60 + 45) },

            { label: "01:00 pm", value: "" + (13 * 60 + 0) },
            { label: "01:15 pm", value: "" + (13 * 60 + 15) },
            { label: "01:30 pm", value: "" + (13 * 60 + 30) },
            { label: "01:45 pm", value: "" + (13 * 60 + 45) },

            { label: "02:00 pm", value: "" + (14 * 60 + 0) },
            { label: "02:15 pm", value: "" + (14 * 60 + 15) },
            { label: "02:30 pm", value: "" + (14 * 60 + 30) },
            { label: "02:45 pm", value: "" + (14 * 60 + 45) },

            { label: "03:00 pm", value: "" + (15 * 60 + 0) },
            { label: "03:15 pm", value: "" + (15 * 60 + 15) },
            { label: "03:30 pm", value: "" + (15 * 60 + 30) },
            { label: "03:45 pm", value: "" + (15 * 60 + 45) },

            { label: "04:00 pm", value: "" + (16 * 60 + 0) },
            { label: "04:15 pm", value: "" + (16 * 60 + 15) },
            { label: "04:30 pm", value: "" + (16 * 60 + 30) },
            { label: "04:45 pm", value: "" + (16 * 60 + 45) },

            { label: "05:00 pm", value: "" + (17 * 60 + 0) },
            { label: "05:15 pm", value: "" + (17 * 60 + 15) },
            { label: "05:30 pm", value: "" + (17 * 60 + 30) },
            { label: "05:45 pm", value: "" + (17 * 60 + 45) },

            { label: "06:00 pm", value: "" + (18 * 60 + 0) },
            { label: "06:15 pm", value: "" + (18 * 60 + 15) },
            { label: "06:30 pm", value: "" + (18 * 60 + 30) },
            { label: "06:45 pm", value: "" + (18 * 60 + 45) },

            { label: "07:00 pm", value: "" + (19 * 60 + 0) },
            { label: "07:15 pm", value: "" + (19 * 60 + 15) },
            { label: "07:30 pm", value: "" + (19 * 60 + 30) },
            { label: "07:45 pm", value: "" + (19 * 60 + 45) },

            { label: "08:00 pm", value: "" + (20 * 60 + 0) },
            { label: "08:15 pm", value: "" + (20 * 60 + 15) },
            { label: "08:30 pm", value: "" + (20 * 60 + 30) },
            { label: "08:45 pm", value: "" + (20 * 60 + 45) },

            { label: "09:00 pm", value: "" + (21 * 60 + 0) },
            { label: "09:15 pm", value: "" + (21 * 60 + 15) },
            { label: "09:30 pm", value: "" + (21 * 60 + 30) },
            { label: "09:45 pm", value: "" + (21 * 60 + 45) },

            { label: "10:00 pm", value: "" + (22 * 60 + 0) },
            { label: "10:15 pm", value: "" + (22 * 60 + 15) },
            { label: "10:30 pm", value: "" + (22 * 60 + 30) },
            { label: "10:45 pm", value: "" + (22 * 60 + 45) },

            { label: "11:00 pm", value: "" + (23 * 60 + 0) },
            { label: "11:15 pm", value: "" + (23 * 60 + 15) },
            { label: "11:30 pm", value: "" + (23 * 60 + 30) },
            { label: "11:45 pm", value: "" + (23 * 60 + 45) },
        ];
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