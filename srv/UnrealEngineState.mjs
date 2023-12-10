import fs from "fs";
import { SimpleObj } from "../srcJs/SimpleObj.js";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import he from 'he';

export class UnrealEngineState {
    estado = {};

    processFlowChart(xmlFlow) {
        const simple = {
            shapes: [],
            arrows: [],
        };
        const nodos = xmlFlow?.mxfile?.diagram?.mxGraphModel?.root?.mxCell;
        if (nodos instanceof Array) {
            for (let i = 0; i < nodos.length; i++) {
                const nodo = nodos[i];
                const id = nodo['@_id'];
                const source = nodo['@_source'];
                const target = nodo['@_target'];
                const txt = nodo["@_value"];
                let texto = '';
                if (typeof txt == "string") {
                    texto = he.decode(nodo["@_value"]);
                    texto = texto.replace(/<\/?br\/?>/ig, '\n');
                }
                const style = nodo['@_style'];
                const details = nodo['mxGeometry'];
                if (source && target) {
                    // Es una flecha
                    const nuevaFlecha = {
                        src: source,
                        tar: target,
                        txt: texto
                    }
                    simple.arrows.push(nuevaFlecha);
                } else {
                    let shapeType = 'box';
                    if (style) {
                        if (style.startsWith('ellipse')) {
                            shapeType = 'ellipse';
                        } else if (style.startsWith('rhombus')) {
                            shapeType = 'rhombus';
                        }
                    }
                    // read coordinates
                    if (details) {
                        const pos = {
                            width: parseInt(details['@_width']),
                            height: parseInt(details['@_height']),
                            x: parseInt(details['@_x']),
                            y: parseInt(details['@_y']),
                        };
                        simple.shapes.push({
                            id,
                            pos,
                            txt: texto,
                            type: shapeType
                        });
                    }
                }
            }
        }
        return simple;
    }

    loadState(id) {
        const data = fs.readFileSync(`./data/ue/scenes/${id}.json`, 'utf8');
        const xmlFlowText = fs.readFileSync(`./data/ue/scenes/${id}.drawio`, 'utf8');
        const options = {
            ignoreAttributes: false,
        };
        const parser = new XMLParser(options);
        const xmlFlow = parser.parse(xmlFlowText)
        this.estado = JSON.parse(data);
        //this.estado.flow = xmlFlow;
        this.estado.f1 = this.processFlowChart(xmlFlow);
        return this.estado;
    }
    writeKey(key, val) {
        SimpleObj.recreate(this.estado, key, val, true);
    }
    readKey(key) {
        return SimpleObj.getValue(this.estado, key);
    }
}