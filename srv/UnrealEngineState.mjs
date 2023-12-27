import fs from "fs";
import { SimpleObj } from "../srcJs/SimpleObj.js";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import he from 'he';
import { FlowChartDiagram } from "../srcJs/FlowChartDiagram.js";

export class UnrealEngineState {
    static inmemoryDisk = {};
    estado = {};

    processFlowChart(xmlFlow) {
        const nodos = xmlFlow?.mxfile?.diagram?.mxGraphModel?.root?.mxCell;
        return FlowChartDiagram.processFlowChart(nodos, he);
    }

    getIdNodeWithText(text) {
        const founds = [];
        const shapes = this.estado.zflowchart?.shapes;
        if (shapes instanceof Array) {
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                if (shape.txt == text) {
                    founds.push(shape.id);
                }
            }
        }
        return founds;
    }

    saveInMemoryTextFile(key, value) {
        const inmemoryDisk = UnrealEngineState.inmemoryDisk;
        inmemoryDisk[key] = value;
    }

    async proxyReadFile(key) {
        const inmemoryDisk = UnrealEngineState.inmemoryDisk;
        const USE_CACHE_FILES = process.env.USE_CACHE_FILES || "1";
        if (USE_CACHE_FILES == "1") {
            if (key in inmemoryDisk) {
                let base64 = inmemoryDisk[key];
                const indice = base64.indexOf(';base64,');
                let mimeType = base64.substring(0, indice);
                mimeType = mimeType.replace(/^data:/, '');
                base64 = base64.substring(indice + 8);
                const buff = Buffer.from(base64, 'base64');
                const blob = new Blob([buff], { type: mimeType });
                const texto = await blob.text();
                return texto;
            }
        }
        const data = fs.readFileSync(key, 'utf8');
        if (USE_CACHE_FILES == "1") {
            inmemoryDisk[key] = "data:text/plain;base64," + Buffer.from(data, "utf8").toString('base64');
        }
        return data;
    }

    async loadState(id) {
        const data = await this.proxyReadFile(`./data/ue/scenes/${id}.json`);
        this.estado = JSON.parse(data);
        const xmlFlowText = await this.proxyReadFile(`./data/ue/scenes/${this.estado.scene.flowchart}`);
        const options = {
            ignoreAttributes: false,
        };
        const parser = new XMLParser(options);
        const xmlFlow = parser.parse(xmlFlowText)

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