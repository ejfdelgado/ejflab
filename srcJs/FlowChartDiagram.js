
class FlowChartDiagram {
    static searchClosest(srcList, tarList) {
        let closestDistance = null;
        let srcPos = null;
        let tarPos = null;
        for (let i = 0; i < srcList.length; i++) {
            for (let j = 0; j < tarList.length; j++) {
                const srcTmp = srcList[i];
                const tarTmp = tarList[j];
                const distance = Math.sqrt(
                    Math.pow(srcTmp.x - tarTmp.x, 2) + Math.pow(srcTmp.y - tarTmp.y, 2)
                );
                if (closestDistance == null || distance < closestDistance) {
                    closestDistance = distance;
                    srcPos = srcTmp;
                    tarPos = tarTmp;
                }
            }
        }
        return {
            src: srcPos,
            tar: tarPos,
        };
    }
    static computeGraph(grafo) {
        const lineHeight = 15;
        let svgContent = '';
        const style = 'fill:rgb(255,255,255);stroke-width:1;stroke:rgb(0,0,0)';
        const styleTar = 'fill:rgb(0,0,0);stroke-width:1;stroke:rgb(0,0,0)';
        if (grafo) {
            const shapes = grafo.shapes;
            const arrows = grafo.arrows;
            const centers = {};
            if (shapes instanceof Array) {
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];
                    const id = shape.id;
                    const pos = shape.pos;
                    centers[id] = [
                        {
                            x: parseInt(pos.x),
                            y: parseInt(pos.y + pos.height * 0.5),
                        },
                        {
                            x: parseInt(pos.x + pos.width * 0.5),
                            y: parseInt(pos.y),
                        },
                        {
                            x: parseInt(pos.x + pos.width),
                            y: parseInt(pos.y + pos.height * 0.5),
                        },
                        {
                            x: parseInt(pos.x + pos.width * 0.5),
                            y: parseInt(pos.y + pos.height),
                        },
                    ];
                }
                // Acá van las líneas
                if (arrows instanceof Array) {
                    for (let i = 0; i < arrows.length; i++) {
                        const arrow = arrows[i];
                        const srcList = centers[arrow.src];
                        const tarList = centers[arrow.tar];
                        // Debo buscar la combinación más corta
                        const { src, tar } = FlowChartDiagram.searchClosest(srcList, tarList);
                        svgContent += `<line x1="${src.x}" x2="${tar.x}" y1="${src.y}" y2="${tar.y}" stroke="black" stroke-width="1" stroke-linecap="round"/>`;
                        svgContent += `<ellipse cx="${tar.x}" cy="${tar.y}" rx="5" ry="5" style="${styleTar}"></ellipse>`;
                        // Se escribe el texto de la línea
                        if (typeof arrow.txt == "string") {
                            const lines = arrow.txt.split(/\n/g);
                            const pos = {
                                x: Math.min(src.x, tar.x),
                                y: Math.min(src.y, tar.y),
                                width: Math.abs(src.x - tar.x),
                                height: Math.abs(src.y - tar.y),
                            };
                            for (let j = 0; j < lines.length; j++) {
                                const line = lines[j];
                                const xPos = pos.x + pos.width * 0.5;
                                const yPos = pos.y +
                                    pos.height * 0.5 +
                                    j * lineHeight -
                                    (lines.length - 1) * lineHeight * 0.5 +
                                    lineHeight * 0.25;
                                svgContent += `<text font-family="Helvetica" font-size="13px" text-anchor="middle" x="${xPos}" y="${yPos}" fill="black">${line}</text>`;
                            }
                        }
                    }
                }
                // Acá van los nodos
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];
                    const id = shape.id;
                    const pos = shape.pos;
                    if (shape.type == 'box') {
                        svgContent += `<rect rx="5" x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" style="${style}"></rect>`;
                    } else if (shape.type == 'ellipse') {
                        svgContent += `<ellipse cx="${pos.x + pos.width * 0.5}" cy="${pos.y + pos.height * 0.5
                            }" rx="${pos.width * 0.5}" ry="${pos.height * 0.5
                            }" style="${style}"></ellipse>`;
                    } else if (shape.type == 'rhombus') {
                        svgContent += `<polygon points="`;
                        svgContent += `${pos.x.toFixed(0)},${pos.y + pos.height * 0.5} `;
                        svgContent += `${pos.x + pos.width * 0.5},${pos.y.toFixed(0)} `;
                        svgContent += `${(pos.x + pos.width).toFixed(0)},${pos.y + pos.height * 0.5
                            } `;
                        svgContent += `${pos.x + pos.width * 0.5},${(
                            pos.y + pos.height
                        ).toFixed(0)}" `;
                        svgContent += `style="${style}"/>`;
                    }
                    if (typeof shape.txt == 'string') {
                        const lines = shape.txt.split(/\n/g);
                        for (let j = 0; j < lines.length; j++) {
                            const line = lines[j];
                            svgContent += `<text font-family="Helvetica" font-size="13px" text-anchor="middle" x="${pos.x + pos.width * 0.5
                                }" y="${pos.y +
                                pos.height * 0.5 +
                                j * lineHeight -
                                (lines.length - 1) * lineHeight * 0.5 +
                                lineHeight * 0.25
                                }" fill="black">${line}</text>`;
                        }
                    }
                }
            }
        }
        return svgContent;
    }
    static processFlowChart(nodos, he = null) {
        const simple = {
            shapes: [],
            arrows: [],
        };
        if (nodos instanceof Array) {
            // Se preprocesan las flechas
            const mapaFlechas = {};
            for (let i = 0; i < nodos.length; i++) {
                const nodo = nodos[i];
                const id = nodo['@_id'];
                const source = nodo['@_source'];
                const target = nodo['@_target'];
                if (source && target) {
                    mapaFlechas[id] = { original: nodo };
                }
            }
            // Se procesan los nodos
            for (let i = 0; i < nodos.length; i++) {
                const nodo = nodos[i];
                const id = nodo['@_id'];
                const source = nodo['@_source'];
                const parentId = nodo['@_parent'];
                const parentArrow = mapaFlechas[parentId];
                const target = nodo['@_target'];
                const txt = nodo["@_value"];
                let texto = '';
                if (typeof txt == "string") {
                    texto = txt;
                    if (he != null) {
                        texto = he.decode(texto);
                    }
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
                    mapaFlechas[id].ref = nuevaFlecha;
                    simple.arrows.push(nuevaFlecha);
                } else {
                    if (parentArrow) {
                        // Save text
                        parentArrow.txt = texto;
                        continue;
                    }
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
            // Se escriben los textos que quedaron faltando
            const llavesFlechas = Object.keys(mapaFlechas);
            for (let i = 0; i < llavesFlechas.length; i++) {
                const llave = llavesFlechas[i];
                const flecha = mapaFlechas[llave];
                if (flecha.ref.txt == "") {
                    let temp = flecha.txt;
                    if (typeof temp == "string") {
                        if (he != null) {
                            temp = he.decode(temp);
                        }
                        temp = temp.replace(/<\/?br\/?>/ig, '\n');
                    }
                    flecha.ref.txt = temp;
                }
            }
        }
        return simple;
    }
}

module.exports = {
    FlowChartDiagram
};