const { CsvFormatter } = require("./CsvFormatter");
const { CsvFormatterFilters } = require("./CsvFormatterFilters");

const myTest = () => {
    const dataset1 = [
        { name: "Ed", color: 1, friends: [{ name: "Bo" }, { name: "Elisa" }] },
        { name: null, color: 2, friends: [{ name: "Bo" }, {}] },
        { name: "Other\nNew", color: null, friends: [{ name: "B;o" }, {}] },
    ];

    const cases = [
        { data: dataset1, header: 'name', exp: "Ed;\n;\nOther New;\n", def: "" },
        { data: dataset1, header: 'name|noNewLine:"_"', exp: "Ed;\n;\nOther_New;\n", def: "" },
        { data: dataset1, header: 'friends.0.name', exp: "Bo;\nBo;\nB o;\n", def: "" },
        { data: dataset1, header: 'color|mapColor', exp: "red;\nblue;\nN/A;\n", def: "N/A" },
        { data: dataset1, header: 'noe', exp: "N/A;\nN/A;\nN/A;\n", def: "N/A" },
        { data: dataset1, header: 'friends.0.name', exp: "friends.0.name;\nBo;\nBo;\nB o;\n", def: "", useHeader: true },
    ];

    const myParser = new CsvFormatter();
    myParser.registerClass(CsvFormatterFilters);
    myParser.registerFunction("noNewLine", CsvFormatterFilters.noNewLine);
    myParser.registerFunction("mapColor", CsvFormatterFilters.map({ 1: "red", 2: "blue" }));
    myParser.setSeparator(";");

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i];
        const myExpected = myCase.exp;
        const response = myParser.parse(myCase.data, myCase.header, myCase.useHeader, myCase.def);
        if (response !== myExpected) {
            throw Error(`expected ${JSON.stringify(myExpected)} actual ${JSON.stringify(response)}`);
        } else {
            console.log(`case ${i + 1} OK! ${JSON.stringify(myExpected)} equals ${JSON.stringify(response)}`);
        }
    }
}

myTest();