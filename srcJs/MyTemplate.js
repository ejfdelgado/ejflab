const { CsvWithFilters } = require("./CsvWithFilters");
const { SimpleObj } = require("./SimpleObj");

const pInicio = "\\$\\s*\\[\\s*for\\s+([^\\s\\]]+)\\s+in\\s+([^\\s\\]]+\\s*})\\]";
const pFin = "\\$\\s*\\[\\s*endfor\\s*\\]";
const pNoFor = "((?!\\$\\s*\\[for).)*?";
const pAny = "(.*?)";

const pIfInicio = "\\$\\s*\\[\\s*if\\s+([^\\]]*?)\\s*\\]";
const pIfFin = "\\$\\s*\\[\\s*endif\\s*\\]";
const pElse = "\\$\\s*\\[\\s*else\\s*\\]";

class MyTemplate extends CsvWithFilters {
    static interpolate(text, model) {
        const renderer = new MyTemplate();
        return renderer.render(text, model);
    }
    // ${algo} -> algo
    static getBiggerOpenClose(text, startPattern, endPattern, openIndex, closeIndex, extractDataFun, elsePattern = null, elseIndex = 4) {
        let startOrEnd;
        if (elsePattern == null) {
            startOrEnd = new RegExp("(" + startPattern + ")|(" + endPattern + ")", "gsi");
        } else {
            startOrEnd = new RegExp("(" + startPattern + ")|(" + endPattern + ")|(" + elsePattern + ")", "gsi");
        }
        let m;
        let starterFor = null;
        let closeFor = null;
        let elseTag = null;
        let closeCounter = 0;
        do {
            m = startOrEnd.exec(text);
            if (m) {
                if (m[closeIndex] !== undefined) {
                    // Is closing
                    if (starterFor == null) {
                        throw Error("Template error, can not close without start");
                    }
                    if (closeCounter == 0) {
                        closeFor = {
                            startIndex: m.index,
                            finishIndex: m.index + m[0].length
                        };
                        break;
                    }
                    closeCounter--;
                } else if (m[openIndex] !== undefined) {
                    // Is oppening
                    if (starterFor == null) {
                        starterFor = extractDataFun(m);
                        starterFor.startIndex = m.index;
                        starterFor.finishIndex = m.index + m[0].length;
                    } else {
                        closeCounter++;
                    }
                } else if (m[elseIndex] !== undefined) {
                    if (closeCounter == 0) {
                        elseTag = {
                            startIndex: m.index,
                            finishIndex: m.index + m[0].length
                        };
                    }
                }
            }
        } while (m);
        if (starterFor == null) {
            //There is no mode fors...
            return null;
        }
        if (starterFor !== null && closeFor == null) {
            throw Error(`Expected close somewhere after ${starterFor.match}`);
        }
        return {
            starterFor,
            closeFor,
            elseTag
        };
    }
    static getBiggerIf(text) {
        const temp = MyTemplate.getBiggerOpenClose(text, pIfInicio, pIfFin, 1, 3, (m) => {
            return {
                formula: m[2],
            };
        }, pElse);
        if (temp == null) {
            return null;
        }
        const {
            starterFor,
            closeFor,
            elseTag,
        } = temp;
        const response = {
            formula: starterFor.formula,
            part1: text.substring(0, starterFor.startIndex),
            part2: text.substring(closeFor.finishIndex),
            localTemplateFalse: "",
        };

        if (elseTag == null) {
            response.localTemplateTrue = text.substring(starterFor.finishIndex, closeFor.startIndex);
        } else {
            response.localTemplateTrue = text.substring(starterFor.finishIndex, elseTag.startIndex);
            response.localTemplateFalse = text.substring(elseTag.finishIndex, closeFor.startIndex);
        }
        return response;
    }
    static getBiggerFor(text) {
        const temp = MyTemplate.getBiggerOpenClose(text, pInicio, pFin, 1, 4, (m) => {
            return {
                match: m[0],
                varName: m[2],
                arrayname: m[3],
            }
        });
        if (temp == null) {
            return null;
        }
        const {
            starterFor,
            closeFor
        } = temp;
        return {
            varName: starterFor.varName,
            arrayName: MyTemplate.getVariableNames(starterFor.arrayname),
            localTemplate: text.substring(starterFor.finishIndex, closeFor.startIndex),
            part1: text.substring(0, starterFor.startIndex),
            part2: text.substring(closeFor.finishIndex),
        };
    }
    static getVariableNames(text) {
        return text.replace(/\$\s*\{\s*([^}]+?)\s*\}/g, "$1");
    }
    replaceFors(template, data) {
        // Expand for
        // ${for color in colores} este es mi ${color.id} ${endfor}
        const someFor = MyTemplate.getBiggerFor(template);
        if (someFor == null) {
            return {
                template,
                times: 0,
            };
        }
        const {
            arrayName,
            localTemplate,
            part1,
            part2,
            varName
        } = someFor;
        let response = [];
        const valor = SimpleObj.getValue(data, arrayName);
        if (valor != null && typeof valor == "object") {
            const llaves = Object.keys(valor);
            response = llaves.map((llave) => {
                const keyPatter = new RegExp("\\$\\{" + varName, "g");
                //console.log(`keyPatter = ${keyPatter}`);
                return localTemplate.replace(keyPatter, (match) => {
                    return "${" + arrayName + "." + llave;
                });
            });
        }
        const middle = response.join("");
        return {
            template: part1 + middle + part2,
            times: 1
        };
    }
    replaceIfs(template, data) {
        const someIf = MyTemplate.getBiggerIf(template);
        if (someIf == null) {
            return {
                template,
                times: 0,
            };
        }

        const plainFormula = this.replaceBareValues(someIf.formula, data, "\\{", "\\}", "\\}", true);
        //console.log(plainFormula);
        const isTrue = eval(plainFormula);// Yes it's safe here, believeme, uncomment above
        if (isTrue === true) {
            return {
                template: someIf.part1 + someIf.localTemplateTrue + someIf.part2,
                times: 1,
            };
        } else {
            return {
                template: someIf.part1 + someIf.localTemplateFalse + someIf.part2,
                times: 1,
            };
        }
    }
    render(template, data) {

        let iteration = {};
        do {
            iteration = this.replaceFors(template, data);
            template = iteration.template;
        } while (iteration.times > 0);

        // Evaluate ${if ...} ${endif}
        do {
            iteration = this.replaceIfs(template, data);
            template = iteration.template;
        } while (iteration.times > 0);

        // Replace values
        return this.replaceBareValues(template, data);
    }
    replaceBareValues(template, data, open = "\\{", close = "\\}", closeNoScape = "}", useStringify = false) {
        const myPattern = new RegExp("\\$" + open + "([^" + closeNoScape + "]+)\\s*" + close, "g");
        template = template.replace(myPattern, (match, g1) => {
            const response = this.getColumnDescription(g1)[0];
            const valor = SimpleObj.getValue(data, response.id);
            if (!useStringify) {
                return this.filterValue(valor, response);
            } else {
                const temp = this.filterValue(valor, response);
                return JSON.stringify(temp);
            }
        });
        return template;
    }
};

module.exports = {
    MyTemplate,
    pInicio,
    pFin,
    pNoFor,
    pAny
};