
function extractInputs(data) {
    let inputs = []
    inputs = data.map(d => [d.fixed_acidity, d.volatile_acidity, d.citric_acid, d.residual_sugar, d.chlorides, d.free_sulfur_dioxide, d.total_sulfur_dioxide, d.density, d.pH, d.sulphates, d.alcohol])
    return inputs;
}

/**
  * @desc converts data from json format to tensors
  * @param json data - complete json that contains wine quality data 
  * @return tuple of converted data that can be used for training model
*/
function prepareDataFunction(data) {

    return tf.tidy(() => {
        tf.util.shuffle(data);

        const inputs = extractInputs(data);
        const outputs = data.map(d => d.quality);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
        const outputTensor = tf.oneHot(tf.tensor1d(outputs, 'int32'), 10);

        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const outputMax = outputTensor.max();
        const outputMin = outputTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedoutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

        return {
            inputs: normalizedInputs,
            outputs: normalizedoutputs,
            inputMax,
            inputMin,
            outputMax,
            outputMin,
        }
    });
}

const run = async () => {

    //https://www.geeksforgeeks.org/tensorflow-js-tf-tensor2d-function/
    const data = {
        in: [
            // pink, small
            [0.1, 0.1],
            [0.3, 0.3],
            [0.5, 0.6],
            [0.4, 0.8],
            [0.9, 0.1],
            [0.75, 0.4],
            [0.75, 0.9],
            [0.6, 0.9],
            [0.6, 0.75]
        ],
        out: [
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [0, 1, 0],
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
        ],
        layers: [
            {
                units: 3,
                activation: "relu"
            },
        ],
        compile: {
            loss: "binaryCrossentropy",
            metrics: ["accuracy"]
        },
        fit: {
            shuffle: true,
            epochs: 20,
            validationSplit: 0.1,
        },
        test: {
            in: [
                [0.1, 0.1],
                [0.3, 0.3],
                [0.5, 0.6],
                [0.4, 0.8],
                [0.9, 0.1],
                [0.75, 0.4],
                [0.75, 0.9],
                [0.6, 0.9],
                [0.6, 0.75]
            ],
            out: [
                [1, 0, 1],
                [1, 0, 1],
                [0, 1, 0],
                [0, 1, 0],
                [1, 0, 1],
                [1, 0, 1],
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
            ]
        }
    };

    // Se calcula la dimension de entrada y salida
    data.dims = {
        in: data.in[0].length,
        out: data.out[0].length,
    };
    console.log(JSON.stringify(data.dims));

    const X = tf.tensor2d(data.in);
    const y = tf.tensor2d(data.out);

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

    // Test the neural network
    /*
    const predProb = model.predict(tf.tensor2d(data.test.in)).dataSync();
    console.log("predProb:" + JSON.stringify(predProb));
    */

    const results = await model.evaluate(tf.tensor2d(data.test.in), tf.tensor2d(data.test.out), { batchSize: 2 });
    console.log('Accuracy is:')
    results[1].print();
};

// run();