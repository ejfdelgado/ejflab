import * as tf from '@tensorflow/tfjs-node'
import { MyTensorflow } from "./MyTensorflow.js";
import fs from 'fs'

export default class MyTensorflowBack extends MyTensorflow {
    static test() {
        const csvText = fs.readFileSync("./data/tensordata.csv", { encoding: "utf8" });
        const csvTestText = fs.readFileSync("./data/tensordata.test.csv", { encoding: "utf8" });
        const jsonMeta = JSON.parse(fs.readFileSync("./data/tensordata.json", { encoding: "utf8" }));
    
        const tensorflow = new MyTensorflowBack();
        tensorflow.setData(csvText, jsonMeta, csvTestText);
        tensorflow.run(tf);
    }
}

MyTensorflowBack.test();