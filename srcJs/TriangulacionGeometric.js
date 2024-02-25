const fs = require('fs');

// clear && node TriangulacionGeometric.js

class TriangulacionGeometric {
    static TO_RADIANS = Math.PI / 180;
    static TO_DEGRES = 180 / Math.PI;
    static ANGLE_STEP = 5;
    static computeAngle(x, y) {
        let valor = Math.atan2(y, x) * TriangulacionGeometric.TO_DEGRES;
        if (valor < 0) {
            valor += 360;
        }
        return valor;
    }
    static generateUnaryVector(angle) {
        return {
            x: Math.cos(angle * TriangulacionGeometric.TO_RADIANS),
            y: Math.sin(angle * TriangulacionGeometric.TO_RADIANS),
        };
    }
    static computePolygonCoordinates(config, center, globales) {
        //200, 10, 250, 190, 150, 190
        const coordinates = [];

        // All angles in degrees
        // 1. compute angle of current look at
        const lookAt = config.lookAt;
        const angleLookAt = TriangulacionGeometric.computeAngle(lookAt.x, lookAt.y);
        console.log(`angleLookAt = ${angleLookAt}`);
        // 2. compute min/max angle
        const angleMin = angleLookAt - config.angles.min;
        const angleMax = angleLookAt + config.angles.max;
        console.log(`angleMin = ${angleMin}`);
        console.log(`angleMax = ${angleMax}`);
        // Generate vectors from angles
        const vectorMin = TriangulacionGeometric.generateUnaryVector(angleMin);
        const vectorMax = TriangulacionGeometric.generateUnaryVector(angleMax);

        const centerLocal = {
            x: (config.position.x - center.x) * globales.canvas.scale + globales.canvas.xCenter,
            y: (config.position.y - center.y) * globales.canvas.scale + globales.canvas.yCenter
        };

        // Agrego de min angle, la distancia más corta
        coordinates.push(centerLocal.x + vectorMin.x * config.distance.min * globales.canvas.scale);
        coordinates.push(centerLocal.y + vectorMin.y * config.distance.min * globales.canvas.scale);
        // Agrego de min angle, la distancia más larga
        coordinates.push(centerLocal.x + vectorMin.x * config.distance.max * globales.canvas.scale);
        coordinates.push(centerLocal.y + vectorMin.y * config.distance.max * globales.canvas.scale);

        // Se crean los arcos
        const arcoPequenio = [];


        // Agrego de max angle, la distancia más larga
        coordinates.push(centerLocal.x + vectorMax.x * config.distance.max * globales.canvas.scale);
        coordinates.push(centerLocal.y + vectorMax.y * config.distance.max * globales.canvas.scale);
        // Agrego de max angle, la distancia más corta
        coordinates.push(centerLocal.x + vectorMax.x * config.distance.min * globales.canvas.scale);
        coordinates.push(centerLocal.y + vectorMax.y * config.distance.min * globales.canvas.scale);

        return coordinates;
    }

    static checkPointInside(config, prove) {
        return true;
    }

    static createPolygon(config, center, globales, style) {
        const pointsList = TriangulacionGeometric.computePolygonCoordinates(config, center, globales);
        let textPoints = "";
        if (pointsList.length > 0) {
            textPoints = "" + pointsList[0];
            for (let i = 1; i < pointsList.length; i++) {
                const actual = pointsList[i];
                if (i % 2 == 0) {
                    textPoints += ",";
                } else {
                    textPoints += " ";
                }
                textPoints += actual;
            }
        }
        const polygonText = `<polygon points="${textPoints}" style="fill:${style.fill};stroke:${style.fill};stroke-width:1" />`;
        return polygonText;
    }

    static writePolygonsToFile(text, globales) {
        const svgText = `<!doctype html><html><body>\n<svg style="background-color:lightgrey" height="${globales.canvas.yCenter * 2}" width="${globales.canvas.xCenter * 2}" xmlns="http://www.w3.org/2000/svg">\n\t${text}\n</svg>\n</body></html>`;
        fs.writeFileSync(`./test/svg/test.html`, svgText, { encoding: "utf8" });
    }

    static testComputePolygon() {
        const globales = {
            canvas: {
                xCenter: 250,
                yCenter: 250,
                maxDistance: 300
            }
        };
        const tests = [
            {
                prove: { x: 40, y: 33 },
                style: {
                    fill: "green",
                    stroke: "black"
                },
                config: {
                    position: { x: 10, y: 30 }, lookAt: { x: 0, y: 1 },
                    angles: { min: 0, max: 45 }, distance: { min: 50, max: 300 }
                },
                expectedIsInside: true,
            }
        ];

        globales.canvas.scale = globales.canvas.xCenter / globales.canvas.maxDistance;
        let completeText = "";
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const svgPolygon = TriangulacionGeometric.createPolygon(test.config, test.config.position, globales, test.style);
            completeText += svgPolygon;
            const currentIsInside = TriangulacionGeometric.checkPointInside(test.config, test.prove);
            if (currentIsInside != test.expectedIsInside) {
                throw new Error(`Test ${i + 1} failed`);
            }
        }

        TriangulacionGeometric.writePolygonsToFile(completeText, globales);

        console.log("Celebrate party!");
    }
}

TriangulacionGeometric.testComputePolygon();