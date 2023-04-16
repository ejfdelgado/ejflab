const { CsvFormatterFilters } = require("./CsvFormatterFilters");
const { MyTemplate } = require("./MyTemplate");


function myTest() {
    const renderer = new MyTemplate();

    const cases = [
        {
            txt: "my name is ${name} and I like ${colors.0.id|mapColor} ${colors.0.id|personal:1:2:3}",
            data: { name: "Edgar", colors: [{ id: 1 }] },
            exp: "my name is Edgar and I like red 1-1-2-3",
        },
        {
            txt: "All combines: ${foreach color in ${colors}}${foreach name in ${names}}Color ${color.id|mapColor} + ${name}, ${end}${end}",
            data: { names: { first: "Edgar", last: "Delgado" }, colors: [{ id: 1 }, { id: 2 }] },
            exp: "All combines: Color red + Edgar, Color red + Delgado, Color blue + Edgar, Color blue + Delgado, ",
        },
        /*{
            txt: "${foreach parent in ${parents}} parent ${parent.name} has ${foreach child in ${parent.children}} ${child.name} ${end} ${end}",
            data: {
                parents: [
                    { name: "Dog", children: [{ name: "Pepito" }, { name: "Cuco" }] },
                    { name: "Bird", children: [{ name: "Fly" }, { name: "Shym" }] }
                ]
            },
            exp: "",
        }
        */
    ];

    renderer.registerFunction("mapColor", CsvFormatterFilters.map({ 1: "red", 2: "blue" }));
    renderer.registerFunction("personal", (val, ...args) => {
        return val + "-" + args.join("-");
    });

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i];
        const actual = renderer.render(myCase.txt, myCase.data);
        //console.log(actual);
        if (actual !== myCase.exp) {
            throw Error(`expected:\n${myCase.exp}\nactual:\n${actual}`);
        } else {
            console.log(`case ${i + 1} OK!`);
        }
    }



}

myTest();