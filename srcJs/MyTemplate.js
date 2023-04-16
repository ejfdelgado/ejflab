const { CsvWithFilters } = require("./CsvWithFilters");
const { SimpleObj } = require("./SimpleObj");

class MyTemplate extends CsvWithFilters {
    static replaceFors(template, data) {
        let times = 0;
        // Expand for
        // ${foreach color in colores} este es mi ${color.id} ${end}
        const pInicio = "\\$\\s*{\\s*foreach\\s+([^\\s}]+)\\s+in\\s+([^\\s}]+})}";
        const pFin = "\\$\\s*{\\s*end\\s*}";
        const pNoFor = "((?!\\$\\s*\\{foreach).)*?";
        const pAny = "(.*?)";

        const myForPatter = new RegExp(pInicio + pNoFor + pFin, "gsi");
        template = template.replace(myForPatter, (match, varName, arrayNameOf) => {
            //console.log(`arrayNameOf = ${arrayNameOf}`);
            const arrayName = arrayNameOf.replace(/\$\s*\{([^}]+?)\s*\}/, "$1");
            //console.log(`arrayName = ${arrayName}`);
            const valor = SimpleObj.getValue(data, arrayName.replace());
            const llaves = Object.keys(valor);
            const myLocalP = new RegExp(pInicio + pAny + pFin, "gsi");
            const partes = myLocalP.exec(match);
            const localTemplate = partes[3];
            let response = llaves.map((llave) => {
                const keyPatter = new RegExp("\\$\\{" + varName, "g");
                //console.log(`keyPatter = ${keyPatter}`);
                return localTemplate.replace(keyPatter, (match) => {
                    return "${" + arrayName + "." + llave;
                });
            });
            //console.log(`llaves = ${llaves} varName = ${varName} arrayName = ${arrayName} valor = ${JSON.stringify(valor)}`);
            //console.log(`localTemplate = ${localTemplate}`);
            //console.log(`response = ${response}`);
            times++;
            return response.join("");
        });
        return {
            template,
            times
        };
    }
    render(template, data) {

        let iteration = {};
        do {
            iteration = MyTemplate.replaceFors(template, data);
            template = iteration.template;
        } while (iteration.times > 0);

        // Replace values
        const myPattern = new RegExp("\\$\\{([^}]+)\\s*\\}", "g");
        template = template.replace(myPattern, (match, g1) => {
            const response = this.getColumnDescription(g1)[0];
            const valor = SimpleObj.getValue(data, response.id);
            return this.filterValue(valor, response);
        });
        return template;
    }
};

module.exports = {
    MyTemplate
};