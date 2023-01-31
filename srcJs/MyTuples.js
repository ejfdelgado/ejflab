const sortify = require('./sortify.js');

class MyTuples {
    static TIPOS_BASICOS = ["string", "number", "boolean"];
    static getTuples(o) {
        const response = {};
        let cache = [];
        function visitor(mo, path = []) {
            if (typeof mo == "object") {
                if (mo != null) {
                    if (cache.includes(mo)) return;
                    cache.push(mo);
                }
                for (const [key, value] of Object.entries(mo)) {
                    const rutaLocal = path.concat([key]);
                    const ruta = rutaLocal.join(".");
                    if (MyTuples.TIPOS_BASICOS.indexOf(typeof value) >= 0 || value === null) {
                        response[ruta] = value;
                    } else {
                        if (typeof value == "object" && value !== null && !cache.includes(value)) {
                            if (value instanceof Array) {
                                response[ruta] = [];
                            } else {
                                response[ruta] = {};
                            }
                        }
                        visitor(value, rutaLocal);
                    }
                }
            }
        }
        visitor(o);
        cache = null;
        return response;
    }
    static createBasic(todo, llave, llave2) {
        const llave2EsNumero = (/^\d+$/.exec(llave2) != null);
        if (!(llave in todo)) {
            if (llave2EsNumero) {
                todo[llave] = [];
            } else {
                todo[llave] = {};
            }
        } else {
            const indice = todo[llave];
            if (indice instanceof Array && !llave2EsNumero) {
                //migrar de arreglo a objeto
                const temporal = {};
                for (let i = 0; i < indice.length; i++) {
                    temporal[i] = indice[i];
                }
                todo[llave] = temporal;
            }
        }
        return todo;
    }
    static recreate(todo, llave, valor) {
        const partes = llave.split(".");
        let indice = todo;
        for (let i = 0; i < partes.length - 1; i++) {
            const parte = partes[i];
            if (!(parte in indice)) {
                MyTuples.createBasic(indice, parte, partes[i + 1]);
            }
            indice = indice[parte];
        }
        const ultimaLlave = partes[partes.length - 1];
        if (typeof valor == "object" && valor !== null) {
            if (!indice[ultimaLlave]) {
                if (valor instanceof Array) {
                    indice[ultimaLlave] = [];
                } else {
                    indice[ultimaLlave] = {};
                }
            } else {
                if (!(valor instanceof Array) && indice[ultimaLlave] instanceof Array) {
                    //migrar de arreglo a objeto
                    const temporal = indice[ultimaLlave];
                    const nuevo = {};
                    for (let i = 0; i < temporal.length; i++) {
                        const valorLocal = temporal[i];
                        if (valorLocal !== null) {
                            nuevo[i] = valorLocal;
                        }
                    }
                    indice[ultimaLlave] = nuevo;
                }
            }
        } else {
            indice[ultimaLlave] = valor;
        }
        return todo;
    }
    static getObject(t1, response = {}) {
        const llaves = Object.keys(t1);
        for (let i = 0; i < llaves.length; i++) {
            const llave = llaves[i];
            const valor = t1[llave];
            MyTuples.recreate(response, "t." + llave, valor);
        }
        return response;
    }
    static restarArreglo(a, b) {
        return a.filter((value) => {
            return b.indexOf(value) < 0;
        });
    }
    static intersecionArreglo(a, b) {
        return a.filter((value) => {
            return b.indexOf(value) >= 0;
        });
    }
    static getBuilder() {
        let resultado = {};
        let myFreeze = null;
        let pending = [];
        return {
            build: (buffer) => {
                resultado = MyTuples.getObject(buffer, resultado);
            },
            end: () => {
                if (!resultado.t) {
                    resultado.t = {};
                }
                myFreeze = JSON.stringify(resultado.t);
                return JSON.parse(myFreeze);
            },
            trackDifferences: (nuevo) => {
                const tuplas2 = MyTuples.getTuples(nuevo);
                const tuplas1 = MyTuples.getTuples(JSON.parse(myFreeze));

                const tuplas2Keys = Object.keys(tuplas2);
                const tuplas1Keys = Object.keys(tuplas1);

                // Calculas las nuevas (llaves de 2 menos las llaves de 1)
                const nuevas = MyTuples.restarArreglo(tuplas2Keys, tuplas1Keys);
                // Calcular las borradas (llaves de 1 menos las llaves de 2)
                const borradas = MyTuples.restarArreglo(tuplas1Keys, tuplas2Keys);
                // Calcular las modificadas (ver intersección de llaves)
                const modificadas = MyTuples.intersecionArreglo(tuplas1Keys, tuplas2Keys);

                const batch = {
                    "+": [],
                    "-": [],
                    "*": [],
                };

                for (let i = 0; i < nuevas.length; i++) {
                    const llave = nuevas[i];
                    batch["+"].push({
                        k: llave,
                        v: tuplas2[llave],
                    });
                }
                for (let i = 0; i < borradas.length; i++) {
                    const llave = borradas[i];
                    batch["-"].push({
                        k: llave,
                    });
                }
                for (let i = 0; i < modificadas.length; i++) {
                    const llave = modificadas[i];
                    if (JSON.stringify(tuplas1[llave]) != JSON.stringify(tuplas2[llave])) {
                        batch["*"].push({
                            k: llave,
                            v: tuplas2[llave],
                        });
                    }
                }

                myFreeze = JSON.stringify(nuevo);
                pending.push(batch);
                return batch;
            }
        };
    }
    static testArray() {
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
    static test() {
        const BATCH_SIZE = 3;
        const reverse = false;
        const show = false;
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
                i: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfgfsdgfsdg" }, c: [{ g: 5 }, { g: 6 }, { g: 7 }] },
                e: { "+": [], "-": [], "*": [] },
            },
            {
                f: { a: { 1: 6, 4: 5 } },
                i: { a: { 1: 6, 4: 5 } },
                e: { "+": [], "-": [], "*": [] },
            }, //esto no se debe guardar porque pasará a ser un arreglo
        ];

        // Las funciones se deben ignorar
        pruebas[0].i.p = function () { };
        // Los loops se deben ignorar
        pruebas[5].i.loop = pruebas[5].i;

        for (let i = 0; i < pruebas.length; i++) {
            const prueba = pruebas[i];
            const tuplas = MyTuples.getTuples(prueba.i);
            const referencia = sortify(prueba.i);
            const intercambio = sortify(tuplas);
            let buffer = {};
            const builder = MyTuples.getBuilder();
            let llaves1 = Object.keys(tuplas);
            if (reverse) {
                llaves1 = llaves1.reverse();
            }
            llaves1.forEach(element => {
                buffer[element] = tuplas[element];
                if (Object.keys(buffer).length >= BATCH_SIZE) {
                    builder.build(buffer);
                    buffer = {};
                }
            });
            if (Object.keys(buffer).length > 0) {
                builder.build(buffer);
                buffer = {};
            }
            const resultadoTxt = sortify(builder.end());

            const differences = builder.trackDifferences(prueba.f);
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
                throw Error(`Modificación fallida ${JSON.stringify(prueba)}`);
            }
        }
    }
}

MyTuples.test();
MyTuples.testArray();

module.exports = {
    MyTuples
};