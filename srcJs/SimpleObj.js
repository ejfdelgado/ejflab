class SimpleObj {
    static convertMapToArray(myMap) {
        const keys = Object.keys(myMap);
        const response = [];
        for (let i = 0; i < keys.length; i++) {
            const myKey = parseInt(keys[i]);
            if (!isNaN(myKey)) {
                response[myKey] = myMap[keys[i]];
            }
        }
        return response;
    }
    static getValue(obj, key, myDefault = undefined) {
        let current = obj;
        const canIterate = (some) => {
            return (typeof some == "object" && some !== null);
        };
        if (!canIterate(current)) {
            return myDefault;
        }
        const partes = key.split(".");
        while (canIterate(current) && partes.length > 0) {
            const firstKey = partes.splice(0, 1)[0];
            current = current[firstKey];
        }
        if (current !== undefined && partes.length == 0) {
            return current;
        } else {
            return myDefault;
        }
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
    static recreate(todo, llave, valor, simple = false) {
        const partes = llave.split(".");
        let indice = todo;
        for (let i = 0; i < partes.length - 1; i++) {
            const parte = partes[i];
            if (!(parte in indice)) {
                SimpleObj.createBasic(indice, parte, partes[i + 1]);
            }
            indice = indice[parte];
        }
        const ultimaLlave = partes[partes.length - 1];
        if (simple) {
            if (valor === undefined) {
                delete indice[ultimaLlave];
            } else {
                indice[ultimaLlave] = valor;
            }
            return todo;
        }
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
            if (!(valor instanceof Array)) {
                Object.assign(indice[ultimaLlave], valor);
            }
        } else {
            indice[ultimaLlave] = valor;
        }
        return todo;
    }
};

module.exports = {
    SimpleObj
};