
//import * as tf from '@tensorflow/tfjs'
//import * as tfvis from "../../../node_modules/@tensorflow/tfjs-vis/dist/index.js";

const { CsvParser } = require("./CsvParser");

class MyTensorflow {

    constructor() {
        console.log("Constructor MyTensorflow");
        this.myData = [];
        this.myTestData = [];
        this.metadata = null;
    }

    setData(textData, jsonMetadata, textTestData) {
        const parser = new CsvParser();
        this.myData = parser.parse(textData, null, true);
        this.myTestData = parser.parse(textTestData, null, true);
        this.metadata = jsonMetadata;
    }

    static clampZeroOne(val, min, max) {
        const tam = (max - min);
        let zeroBased = val - min;
        if (zeroBased < 0) {
            zeroBased = 0;
        }
        let zeroOne = zeroBased / tam;
        if (zeroOne > 1) {
            zeroOne = 1;
        }
        return zeroOne;
    }

    extractInputs(tf, data) {
        const inmetadata = this.metadata.in;
        return data.map((fila) => {
            const resp = [];
            for (let i = 0; i < inmetadata.length; i++) {
                const metadata = inmetadata[i];
                const val = fila[metadata.column];
                const clamped = MyTensorflow.clampZeroOne(val, metadata.min, metadata.max);
                resp.push(clamped);
            }
            return resp;
        });
    }

    extractOutput(tf, data) {
        const outmetadata = this.metadata.out;
        const outputs = data.map((fila) => {
            const val = fila[outmetadata.column];
            const zeroOne = MyTensorflow.clampZeroOne(val, outmetadata.min, outmetadata.max);
            const extended = zeroOne * (outmetadata.ngroups);
            let response = Math.floor(extended);
            if (response == outmetadata.ngroups) {
                response = outmetadata.ngroups - 1;
            }
            return response;
        });
        return outputs;
    }

    prepareData(tf) {
        return tf.tidy(() => {
            const outmetadata = this.metadata.out;
            const data = JSON.parse(JSON.stringify(this.myData));
            const testData = JSON.parse(JSON.stringify(this.myTestData));
            tf.util.shuffle(data);
            tf.util.shuffle(testData);

            const inputs = this.extractInputs(tf, data);
            const output = this.extractOutput(tf, data);

            const inputsTest = this.extractInputs(tf, testData);
            const outputTest = this.extractOutput(tf, testData);

            const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
            const outputTensor = tf.oneHot(tf.tensor1d(output, 'int32'), outmetadata.ngroups);

            const inputTestTensor = tf.tensor2d(inputsTest, [inputsTest.length, inputsTest[0].length]);
            const outputTestTensor = tf.oneHot(tf.tensor1d(outputTest, 'int32'), outmetadata.ngroups);

            //inputTensor.print(true);
            //outputTensor.print(true);

            return {
                inputs: inputTensor,
                outputs: outputTensor,
                inputsTest: inputTestTensor,
                outputsTest: outputTestTensor,
            }
        });
    }

    async run(tf) {
        const {
            inputs,
            outputs,
            inputsTest,
            outputsTest,
        } = this.prepareData(tf);

        const X = inputs;
        const y = outputs;
        const data = this.metadata;
        data.dims = {
            in: inputs.shape[1],
            out: outputs.shape[1],
        };

        const model = tf.sequential();

        for (let i = 0; i < data.layers.length; i++) {
            const actual = data.layers[i];
            const myLayer = {
                name: `hidden-layer-${i + 1}`,
                units: actual.units,
                activation: actual.activation
            }
            if (i == 0) {
                myLayer.inputShape = [data.dims.in];
            }
            model.add(
                tf.layers.dense(myLayer)
            );
        }

        model.add(
            tf.layers.dense({
                units: data.dims.out,
                activation: "softmax"
            })
        );

        const myCompile = Object.assign({}, data.compile, { optimizer: tf.train.adam(0.1) });

        model.compile(myCompile);

        await model.fit(X, y, data.fit);

        const results = await model.evaluate(inputsTest, outputsTest, { batchSize: 2 });
        console.log('Accuracy is:')
        results[1].print();
    }

    static createIntGroups(listOfValues, min, max, nGroups) {
        const tam = (max - min);
        return listOfValues.map((val) => {
            let zeroBased = val - min;
            if (zeroBased < 0) {
                zeroBased = 0;
            }
            let zeroOne = zeroBased / tam;
            if (zeroOne > 1) {
                // clamp
                zeroOne = 1;
            }
            const extended = zeroOne * (nGroups);
            const response = Math.floor(extended);
            //console.log(`val ${val} zeroBased ${zeroBased} zeroOne ${zeroOne} extended ${extended} response ${response}`);
            if (response == nGroups) {
                return nGroups - 1;
            }
            return response;
        });
    }
}

module.exports = {
    MyTensorflow
};