import fs from "fs";
import { SimpleObj } from "../srcJs/SimpleObj.js";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import he from 'he';
import { FlowChartDiagram } from "../srcJs/FlowChartDiagram.js";

export class UnrealEngineState {
    estado = {};

    processFlowChart(xmlFlow) {
        const nodos = xmlFlow?.mxfile?.diagram?.mxGraphModel?.root?.mxCell;
        return FlowChartDiagram.processFlowChart(nodos);
    }

    getIdNodeWithText(text) {
        const shapes = this.estado.zflowchart?.shapes;
        if (shapes instanceof Array) {
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                if (shape.txt == text) {
                    return shape.id;
                }
            }
        }
        return null;
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
        this.estado.zflowchart = this.processFlowChart(xmlFlow);
        return this.estado;
    }
    writeKey(key, val) {
        SimpleObj.recreate(this.estado, key, val, true);
    }
    readKey(key) {
        return SimpleObj.getValue(this.estado, key);
    }
}