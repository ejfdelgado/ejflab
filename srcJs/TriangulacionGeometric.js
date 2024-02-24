const fs = require('fs');

class TriangulacionGeometric {
    static computeAngle(x, y) {
        let valor = Math.atan2(y, x) * 180 / Math.PI;
        if (valor < 0) {
            valor += 360;
        }
        return valor;
    }
    static generateUnaryVector(angle) {
        return {
            x: Math.cos(angle),
        }
    }
    static computePolygonCoordinates(config) {
        const coordinates = [200, 10, 250, 190, 150, 190];

        // All angles in degrees
        // 1. compute angle of current look at
        const lookAt = config.lookAt;
        const angleLookAt = TriangulacionGeometric.computeAngle(lookAt.x, lookAt.y);
        console.log(`angleLookAt = ${angleLookAt}`);
        // 2. compute min/max angle
        const angleMin = angleLookAt - config.angles.min;
        const angleMax = angleLookAt - config.angles.max;
        // Generate vectors from angles

        return coordinates;
    }

    static checkPointInside(config, prove) {
        return true;
    }

    static createPolygon(config, style) {
        const pointsList = TriangulacionGeometric.computePolygonCoordinates(config);
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

    static writePolygonsToFile(text) {
        const svgText = `<!doctype html><html><body>\n<svg height="220" width="500" xmlns="http://www.w3.org/2000/svg">\n\t${text}\n</svg>\n</body></html>`;
        fs.writeFileSync(`./test/svg/test.html`, svgText, { encoding: "utf8" });
    }

    static testComputePolygon() {
        const tests = [
            {
                prove: { x: 40, y: 33 },
                style: {
                    fill: "green",
                    stroke: "black"
                },
                config: {
                    position: { x: 10, y: 20 }, lookAt: { x: 1, y: -0.001 },
                    angles: { min: 10, max: 90 }, distance: { min: 30, max: 80 }
                },
                expectedIsInside: true,
            }
        ];

        let completeText = "";
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const svgPolygon = TriangulacionGeometric.createPolygon(test.config, test.style);
            completeText += svgPolygon;
            const currentIsInside = TriangulacionGeometric.checkPointInside(test.config, test.prove);
            if (currentIsInside != test.expectedIsInside) {
                throw new Error(`Test ${i + 1} failed`);
            }
        }

        TriangulacionGeometric.writePolygonsToFile(completeText);

        console.log("Celebrate party!");
    }
}

TriangulacionGeometric.testComputePolygon();