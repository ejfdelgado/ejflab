
class MyTuples {
    static TIPOS_BASICOS = ["string", "number", "boolean"];
    static convertFromBD(model) {
        const response = {};
        model.forEach((value) => {
            response[value.k] = value.v;
        });
        return response;
    }
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
        const START_BACKOFF = 0;
        const BACK_OFF_MULTIPLIER = 500;
        const MAX_SEND_SIZE = 20;// Cuántas tuplas se pueden afectar en un llamado
        const LOW_PRESSURE_MS = 1000;

        let resultado = {};
        let myFreeze = null;
        let pending = [];
        let procesor = null;
        let listeners = [];
        let ultimaFechaInicio = null;
        let isProcessing = false;

        const addActivityListener = (a) => {
            if (!(a in listeners)) {
                listeners.push(a);
            }
            return () => {
                const indice = listeners.indexOf(a);
                listeners.splice(indice, 1);
            };
        };
        const setActivityStatus = (value) => {
            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i];
                if (typeof listener == "function") {
                    listener(value);
                }
            }
        };

        const startProcess = () => {
            // Single execution
            if (isProcessing) {
                return;
            }
            if (typeof procesor != "function") {
                setActivityStatus(false);
                return;
            }
            // Low pressure
            const ahora = new Date().getTime();
            ultimaFechaInicio = ahora;
            setTimeout(async () => {
                if (ultimaFechaInicio == ahora) {
                    isProcessing = true;
                    // Notify
                    setActivityStatus(isProcessing);
                    // Then try process
                    const processAll = async () => {
                        if (pending.length > 0) {
                            const ultimo = JSON.parse(JSON.stringify(pending.splice(pending.length - 1, 1)[0]));
                            //Se deben partir los cambios en grupos de MAX_SEND_SIZE
                            const crearBatch = () => {
                                const batch = {
                                    "+": [],
                                    "-": [],
                                    "*": [],
                                    total: 0,
                                };
                                const pasarElemento = (simbolo) => {
                                    const lista = ultimo[simbolo];
                                    if (lista.length > 0) {
                                        batch[simbolo].push(lista.splice(lista.length - 1, 1)[0]);
                                        batch.total += 1;
                                        return true;
                                    }
                                    return false;
                                };
                                const pasarAlgunElemento = () => {
                                    return pasarElemento("-") || pasarElemento("+") || pasarElemento("*");
                                };
                                const pasarElementos = () => {
                                    let pasoAlgo = false;
                                    do {
                                        pasoAlgo = pasarAlgunElemento();
                                    } while (pasoAlgo && batch.total < MAX_SEND_SIZE);
                                };
                                pasarElementos();
                                return batch;
                            };

                            let unBatch;
                            do {
                                unBatch = crearBatch();
                                const reintentos = () => {
                                    let backOffCount = START_BACKOFF;
                                    return new Promise((resolve, reject) => {
                                        const unIntento = () => {
                                            // Retry infinitelly with linear backoff
                                            const delay = backOffCount * BACK_OFF_MULTIPLIER;
                                            //console.log(`unIntento delay ${delay}`);
                                            setTimeout(async () => {
                                                try {
                                                    const theResponse = await procesor(unBatch);
                                                    resolve(theResponse);
                                                } catch (error) {
                                                    if ([403].indexOf(error.status) < 0) {
                                                        backOffCount += 1;
                                                        unIntento();
                                                    } else {
                                                        reject(error);
                                                    }
                                                }
                                            }, delay);
                                        };
                                        unIntento();
                                    });
                                };
                                if (unBatch.total > 0) {
                                    await reintentos();
                                }
                            } while (unBatch.total > 0);
                        }
                    };
                    try {
                        await processAll();
                    } catch (err) {
                        // do nothing
                    }
                    isProcessing = false;
                    setActivityStatus(isProcessing);
                }
            }, LOW_PRESSURE_MS);
        };

        return {
            addActivityListener,
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
            affect: (batch) => {
                const tuplas1 = MyTuples.getTuples(JSON.parse(myFreeze));
                const llavesBorrar = batch["-"];
                const llavesNuevasModificadas = batch["*"].concat(batch["+"]);

                //Borro las tuplas
                for (let i = 0; i < llavesBorrar.length; i++) {
                    const llaveBorrar = llavesBorrar[i].k;
                    delete tuplas1[llaveBorrar];
                }
                //Reemplazo las tuplas
                for (let i = 0; i < llavesNuevasModificadas.length; i++) {
                    const nuevaModificar = llavesNuevasModificadas[i];
                    tuplas1[nuevaModificar.k] = nuevaModificar.v;
                }
                const resultado = MyTuples.getObject(tuplas1, {});
                if (!resultado.t) {
                    resultado.t = {};
                }
                myFreeze = JSON.stringify(resultado.t);
                return JSON.parse(myFreeze);
            },
            setProcesor: (p) => {
                procesor = p;
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
                    let valor1 = tuplas1[llave];
                    let valor2 = tuplas2[llave];
                    if (typeof valor1 == "object" && valor1 != null) {
                        valor1 = JSON.stringify(valor1);
                    }
                    if (typeof valor2 == "object" && valor2 != null) {
                        valor2 = JSON.stringify(valor2);
                    }
                    if (valor1 !== valor2) {
                        batch["*"].push({
                            k: llave,
                            v: tuplas2[llave],
                        });
                    }
                }

                myFreeze = JSON.stringify(nuevo);
                pending.push(batch);
                startProcess();
                return batch;
            }
        };
    }
}

module.exports = {
    MyTuples
};