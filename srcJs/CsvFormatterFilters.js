class CsvFormatterFilters {
    static parseInt(valor, myDefault = NaN) {
        const temp = parseInt(valor);
        if (isNaN(temp)) {
            return myDefault;
        } else {
            return temp;
        }
    }
    static parseFloat(valor, myDefault = NaN) {
        const temp = parseFloat(valor);
        if (isNaN(temp)) {
            return myDefault;
        } else {
            return temp;
        }
    }
    static json(valor) {
        return JSON.stringify(valor);
    }
    static rand(val, ...args) {
        let lista = args;
        if (lista.length == 0) {
            lista = val;
        }
        if (!(lista instanceof Array)) {
            return "";
        }
        let myRandom = Math.floor(Math.random() * lista.length);
        return "" + lista[myRandom];
    }
    static map(myMap) {
        return (key) => {
            return myMap[key];
        }
    }
    static noNewLine(valor, replacer = "") {
        if (typeof valor == "string") {
            return valor.replace(/(?:\r\n|\r|\n)/g, replacer);
        }
        return valor;
    }
    static replace(valor, pattern, replacer = "") {
        if (typeof valor == "string") {
            return valor.replace(pattern, replacer);
        }
        return valor;
    }
}

module.exports = {
    CsvFormatterFilters
}