class CsvFormatterFilters {
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