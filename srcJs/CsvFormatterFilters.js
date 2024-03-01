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
        const random = Math.random();
        console.log(`random = ${random}`);
        const myRandom = Math.floor(random * lista.length);
        let choosed = "" + lista[myRandom];
        if (/^\s*true\s*$/i.exec(choosed) !== null) {
            choosed = true;
        } else if (/^\s*false\s*$/i.exec(choosed) !== null) {
            choosed = false;
        } else if (/^\s*\d+\s*$/.exec(choosed) !== null) {
            choosed = parseInt(choosed);
        }
        return choosed;
    }
    static testRandom() {
        const lista = ["a", "b"];
        for (let i = 0; i < 10; i++) {
            console.log(CsvFormatterFilters.rand(lista));
        }
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