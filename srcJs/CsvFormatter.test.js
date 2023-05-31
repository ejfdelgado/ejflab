const fs = require('fs');
const { CsvFormatter } = require("./CsvFormatter");
const { CsvFormatterFilters } = require("./CsvFormatterFilters");
const { MyDates } = require('./MyDates');

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

function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * max);
}

const generateLongCsv = (n) => {
    const data = [];
    for (let i = 0; i < n; i++) {
        const local = {};
        local.d1 = getRandomInt(0, 100);
        local.d2 = getRandomInt(0, 100);
        local.out = 0;
        data.push(local);
    }
    const myParser = new CsvFormatter();
    const response = myParser.parse(data, "d1;d2;out", true);

    const fecha = MyDates.getDayAsContinuosNumberHmmSSmmm(new Date());
    fs.writeFileSync(`./test/csv/test_${n}_${fecha}.csv`, response, { encoding: "utf8" });
};

const testComunidad = () => {
    const db = [
        {
            "REPORTE": {
                "veryOldStatus": null,
                "points": 792,
                "oldStatus": "1",
                "VOTES": [
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 1,
                        "points": 50,
                        "numWin": 1
                    },
                    {
                        "votes": 2,
                        "points": 50,
                        "numWin": 1
                    }
                ],
                "DONATIONS": {
                    "count": 34,
                    "points": 68
                },
                "REPOSTS": {
                    "count": 3,
                    "points": 3
                },
                "STARS": [
                    {
                        "stars": 4,
                        "points": 40
                    },
                    {
                        "stars": 4,
                        "points": 40
                    },
                    {
                        "stars": 5,
                        "points": 50
                    },
                    {
                        "stars": 5,
                        "points": 50
                    },
                    {
                        "stars": 5,
                        "points": 50
                    },
                    {
                        "stars": 4,
                        "points": 40
                    }
                ],
                "SHARE": {
                    "events": 7,
                    "points": 8
                },
                "newStatus": "1",
                "updated": 1685546454903,
                "cutDate": 1654442454903
            },
            "email": "edgar.jose.fernando.delgado@gmail.com",
            "AAAAMMDD": 20230531
        }
    ];

    for (let i = 0; i < db.length; i++) {
        const actual = db[i];
        let stars_detail = {
            count: 0,
            points: 0,
        };
        let votes_detail = {
            count: 0,
            points: 0,
        };
        const starts = actual.REPORTE.STARS;
        for (let j = 0; j < starts.length; j++) {
            const detalle = starts[j];
            stars_detail.count += detalle.stars;
            stars_detail.points += detalle.points;
        }
        const votes = actual.REPORTE.VOTES;
        for (let j = 0; j < votes.length; j++) {
            const detalle = votes[j];
            votes_detail.count += detalle.votes;
            votes_detail.points += detalle.points;
        }
        actual.starts = stars_detail;
        actual.votes = votes_detail;
        actual.share = {
            count: actual.REPORTE.SHARE.events,
            points: actual.REPORTE.SHARE.points,
        };
        delete actual.REPORTE.STARS;
        delete actual.REPORTE.VOTES;
        delete actual.REPORTE.SHARE;
    }

    const myParser = new CsvFormatter();
    const STATUS = {
        "-1": "Miembro",
        "0": "Donador",
        "1": "Donador Silver",
        "2": "Donador Gold",
        "3": "Donador Black",
    };
    myParser.registerFunction("status", CsvFormatterFilters.map(STATUS));
    const response = myParser.parse(db, "email;\
    REPORTE.newStatus|status;\
    REPORTE.points;\
    REPORTE.REPOSTS.count;\
    REPORTE.REPOSTS.points;\
    starts.count;\
    starts.points;\
    votes.count;\
    votes.points;\
    share.count;\
    share.points;\
    ", true);
    console.log(response);
}

//myTest();
//generateLongCsv(1000);
testComunidad();