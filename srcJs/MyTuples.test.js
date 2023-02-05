const { MyTuples } = require('./MyTuples.js');
const sortify = require('./sortify.js');

const test = async () => {
    const BATCH_SIZE = 3;
    const reverse = false;
    const show = false;
    const useProcessor = ["none", "good", "bad"][0];
    const pruebas = [
        {
            f: { a: 2 },
            i: {},
            e: { "+": [{ "k": "a", "v": 2 }], "-": [], "*": [] },//solo agregar
        },
        {
            f: [{}],
            i: [{ 0: true }],
            e: { "+": [], "-": [{ "k": "0.0" }], "*": [] },//solo quitar
        },
        {
            f: [true],
            i: [false],
            e: { "+": [], "-": [], "*": [{ "k": "0", "v": true }] },//solo modificar
        },
        {
            f: { a: 1, b: "t", c: true, e: null, f: "soy nuevo" },
            i: { a: 1, b: "t", c: true, d: false, e: null, f: undefined },
            e: { "+": [{ "k": "f", "v": "soy nuevo" }], "-": [{ "k": "d" }], "*": [] }//agregar y quitar
        },
        {
            f: { a: [], b: { g: 6, h: 7 } },
            i: { a: [2], b: { g: 5 } },
            e: { "+": [{ "k": "b.h", "v": 7 }], "-": [{ "k": "a.0" }], "*": [{ "k": "b.g", "v": 6 }] }//agregar, quitar y modificar
        },
        {
            f: { a: { b: { c: [{ h: "hola", i: "como", j: "estas" }] } } },
            i: { a: { b: { c: [3, { h: "hola" }] } } },
            e: { "+": [{ "k": "a.b.c.0.h", "v": "hola" }, { "k": "a.b.c.0.i", "v": "como" }, { "k": "a.b.c.0.j", "v": "estas" }], "-": [{ "k": "a.b.c.1" }, { "k": "a.b.c.1.h" }], "*": [{ "k": "a.b.c.0", "v": {} }] }
        },
        {
            f: [{ e: 3 }, 5, 8, [9]],
            i: [{ e: 3 }, 5, 8, [9]],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            f: { a: 5, b: [], c: {} },
            i: { a: 5, b: [], c: {} },
            e: { "+": [], "-": [], "*": [] },
        },
        {
            f: [1, 2, 3, 4],
            i: [1, 2, 3, 4],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            f: ["1", "2", "3"],
            i: ["1", "2", "3"],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            f: [true, false, true],
            i: [true, false, true],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            f: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfgfsdgfsdg" }, c: [{ g: 5 }, { g: 6 }, { g: 7 }] },
            i: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfggfsdg" }, c: [{ g: 6 }, { g: 7 }] },
            e: { "*": [{ "k": "b.ert", "v": "dzfgfsdgfsdg" }, { "k": "c.0.g", "v": 5 }, { "k": "c.1.g", "v": 6 }], "+": [{ "k": "c.2", "v": {} }, { "k": "c.2.g", "v": 7 }], "-": [] },
        },
        {
            f: { a: { 1: 6, 4: 5 } },
            i: { a: { 1: 6, 4: 5 } },
            e: { "+": [], "-": [], "*": [] },
        }, //esto no se debe guardar porque pasará a ser un arreglo
    ];

    const mockProcessorGood = (payload) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                resolve();
            }, 0);
        });
    };

    const getBadProcessor = () => {
        let count = 0;
        let maxCount = 3;
        const mockProcessorBad = (payload) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (count < maxCount) {
                        console.log(`Processing ${JSON.stringify(payload, null, 4)} ERROR`);
                        reject();
                        count++;
                    } else {
                        console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                        resolve();
                        count = 0;
                    }

                }, 500);
            });
        };
        return mockProcessorBad;
    };

    // Las funciones se deben ignorar
    pruebas[0].i.p = function () { };
    // Los loops se deben ignorar
    pruebas[5].i.loop = pruebas[5].i;

    for (let i = 0; i < pruebas.length; i++) {
        console.log(`Prueba ${i + 1} ----------------------------------------------`);
        const prueba = pruebas[i];
        const tuplas = MyTuples.getTuples(prueba.i);
        const referencia = sortify(prueba.i);
        const intercambio = sortify(tuplas);
        let buffer = {};
        const builder = MyTuples.getBuilder();
        const builder2 = MyTuples.getBuilder();
        if (useProcessor == "bad") {
            builder.setProcesor(getBadProcessor());
        }
        if (useProcessor == "good") {
            builder.setProcesor(mockProcessorGood);
        }
        let llaves1 = Object.keys(tuplas);
        if (reverse) {
            llaves1 = llaves1.reverse();
        }
        llaves1.forEach(element => {
            buffer[element] = tuplas[element];
            if (Object.keys(buffer).length >= BATCH_SIZE) {
                builder.build(buffer);
                builder2.build(buffer);
                buffer = {};
            }
        });
        if (Object.keys(buffer).length > 0) {
            builder.build(buffer);
            builder2.build(buffer);
            buffer = {};
        }
        const resultadoTxt = sortify(builder.end());
        builder2.end();

        const indicadorActividad = new Promise((resolve) => {
            builder.addActivityListener((status) => {
                if (!status) {
                    resolve();
                    console.log("Terminado...");
                } else {
                    console.log("Esperando...");
                }
            });
        });
        const differences = builder.trackDifferences(prueba.f);
        await indicadorActividad;

        const afectado = builder2.affect(differences);

        const differencesTxt = sortify(differences);

        if (show) {
            console.log("--------------------------------------------------------");
            console.log(referencia);
            console.log(intercambio);
            console.log(resultadoTxt);
        }

        if (referencia != resultadoTxt) {
            throw Error(`referencia ${referencia} \nintercambio ${intercambio}\nresultadoTxt ${resultadoTxt}`);
        }

        if (sortify(prueba.e) != differencesTxt) {
            throw Error(`Modificación fallida ${JSON.stringify(prueba)}\n${differencesTxt}`);
        }

        if (sortify(prueba.f) != sortify(afectado)) {
            throw Error(`Afectación fallida ${JSON.stringify(prueba)}`);
        }
        console.log(`Prueba ${i + 1} OK`);
    }
}

const testConverter = () => {
    const pruebas = [
        {
            i: [
                { k: "6543:fdgfd.ghgf.t", v: 2 },
                { k: "6543:fdgfd.ghgf", v: {} },
                { k: "6543:fdgfd", v: {} },
            ],
            o: {
                "6543:fdgfd.ghgf.t": 2,
                "6543:fdgfd.ghgf": {},
                "6543:fdgfd": {},
            }
        },
        {
            i: [],
            o: {},
        }
    ];

    for (let i = 0; i < pruebas.length; i++) {
        const actual = pruebas[i];
        const input = actual.i;
        const o = actual.o;
        const response = MyTuples.convertFromBD(input);

        const oText = sortify(o);
        const responseTxt = sortify(response);
        if (oText != responseTxt) {
            throw new Error(`Prueba fallida ${oText} != ${responseTxt}`);
        }
    }
};

const testArray = () => {
    const restas = [
        { a: [1, 3, 5], b: [3], r: [1, 5] },
        { a: [], b: [4, 7], r: [] },
        { a: [3, 4, 5], b: [], r: [3, 4, 5] },
    ];
    const interseccion = [
        { a: [1, 3, 5], b: [3], r: [3] },
        { a: [], b: [4, 8, 9], r: [] },
        { a: [4, 8, 9], b: [], r: [] },
    ];
    for (let i = 0; i < restas.length; i++) {
        const prueba = restas[i];
        const response = MyTuples.restarArreglo(prueba.a, prueba.b);
        const responseTxt = sortify(response);
        const refTxt = sortify(prueba.r);
        if (responseTxt != refTxt) {
            throw Error(`Resta fallida ${JSON.stringify(prueba)}`);
        }
    }
    for (let i = 0; i < interseccion.length; i++) {
        const prueba = interseccion[i];
        const response = MyTuples.intersecionArreglo(prueba.a, prueba.b);
        const responseTxt = sortify(response);
        const refTxt = sortify(prueba.r);
        if (responseTxt != refTxt) {
            throw Error(`Interseccion fallida ${JSON.stringify(prueba)}`);
        }
    }
}

testConverter();