import * as tf from '@tensorflow/tfjs-node'
//import * as tf from '@tensorflow/tfjs'
//import * as tfvis from "../../../node_modules/@tensorflow/tfjs-vis/dist/index.js";

//https://rubikscode.net/2022/05/10/image-classification-with-tensorflow-js/

const perceptron = ({ x, w, bias }) => {
    const product = tf.dot(x, w).dataSync()[0];
    return product + bias < 0 ? 0 : 1;
};

const sigmoidPerceptron = ({ x, w, bias }) => {
    const product = tf.dot(x, w).dataSync()[0];
    return tf.sigmoid(product + bias).dataSync()[0];
};

// https://towardsdatascience.com/building-a-one-hot-encoding-layer-with-tensorflow-f907d686bf39
const oneHot = (val, categoryCount) =>
    Array.from(tf.oneHot(val, categoryCount).dataSync());

const renderLayer = (model, layerName, container) => {
    /*
  tfvis.show.layer(
    document.getElementById(container),
    model.getLayer(layerName)
  );
  */
};

const run = async () => {
    console.log(
        perceptron({
            x: [0, 1],
            w: [0.5, 0.9],
            bias: -0.5
        })
    );

    console.log(
        sigmoidPerceptron({
            x: [0.6, 0.9],
            w: [0.5, 0.9],
            bias: -0.5
        })
    );

    //https://www.geeksforgeeks.org/tensorflow-js-tf-tensor2d-function/
    const X = tf.tensor2d([
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
    ]);

    // 0 - no buy, 1 - buy
    const temp = [0, 0, 1, 1, 0, 0, 1, 1, 1].map(y => oneHot(y, 2));
    const y = tf.tensor(temp);

    const model = tf.sequential();

    model.add(
        tf.layers.dense({
            name: "hidden-layer",
            inputShape: [2],
            units: 3,
            activation: "relu"
        })
    );

    model.add(
        tf.layers.dense({
            units: 2,
            activation: "softmax"
        })
    );

    model.compile({
        optimizer: tf.train.adam(0.1),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"]
    });

    await model.fit(X, y, {
        shuffle: true,
        epochs: 20,
        validationSplit: 0.1,
        /*callbacks: tfvis.show.fitCallbacks(
            document.getElementById("loss-cont"),
            ["loss", "val_loss", "acc", "val_acc"],
            {
                callbacks: ["onEpochEnd"]
            }
        )*/
    });

    const hiddenLayer = model.getLayer("hidden-layer");
    const [weights, biases] = hiddenLayer.getWeights(true);
    console.log(weights.shape);
    console.log(biases.shape);

    renderLayer(model, "hidden-layer", "hidden-layer-container");

    // Test the neural network
    const predProb = model.predict(tf.tensor2d([[0.1, 0.6]])).dataSync();
    console.log("predProb:" + JSON.stringify(predProb));
};


run();