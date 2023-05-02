import { Component, Input, OnInit } from '@angular/core';

export interface MyTensorflowLayerData {
  units: number;
  activation: string;
}

export interface MyTensorflowInData {
  column: string;
  min: number;
  max: number;
}

export interface MyTensorflowOutData extends MyTensorflowInData {
  ngroups: number;
}

export interface MyTensorflowCompileData {
  loss: string;
  metrics: Array<string>;
}

export interface MyTensorflowFitData {
  shuffle: boolean;
  epochs: number;
  validationSplit: number;
}

export interface MyTensorflowData {
  in: Array<MyTensorflowInData>;
  out: MyTensorflowOutData;
  layers: Array<MyTensorflowLayerData>;
  compile: MyTensorflowCompileData;
  fit: MyTensorflowFitData;
}

export interface ComboBoxData {
  txt: string;
  val: string | number;
}

@Component({
  selector: 'app-tensorflow',
  templateUrl: './tensorflow.component.html',
  styleUrls: ['./tensorflow.component.css'],
})
export class TensorflowComponent implements OnInit {
  @Input('model')
  model: MyTensorflowData;

  activationOptions: Array<ComboBoxData> = [
    { val: 'relu', txt: 'relu' },
    { val: 'softmax', txt: 'softmax' },
    { val: 'elu', txt: 'elu' },
    { val: 'exponential', txt: 'exponential' },
    { val: 'gelu', txt: 'gelu' },
    { val: 'hard_sigmoid', txt: 'hard_sigmoid' },
    { val: 'linear', txt: 'linear' },
    { val: 'selu', txt: 'selu' },
    { val: 'sigmoid', txt: 'sigmoid' },
    { val: 'softplus', txt: 'softplus' },
    { val: 'softsign', txt: 'softsign' },
    { val: 'swish', txt: 'swish' },
    { val: 'tanh', txt: 'tanh' },
  ];

  lossOptions = [
    { val: 'binaryCrossentropy', txt: 'binaryCrossentropy' },
    { val: 'categoricalCrossentropy', txt: 'categoricalCrossentropy' },
    { val: 'meanAbsolutePercentageError', txt: 'meanAbsolutePercentageError' },
    { val: 'categoricalAccuracy', txt: 'categoricalAccuracy' },
    { val: 'meanAbsoluteError', txt: 'meanAbsoluteError' },
    { val: 'cosineProximity', txt: 'cosineProximity' },
    { val: 'recall', txt: 'recall' },
    { val: 'meanSquaredError', txt: 'meanSquaredError' },
    { val: 'sparseCategoricalAccuracy', txt: 'sparseCategoricalAccuracy' },
    { val: 'precision', txt: 'precision' },
  ];

  constructor() {}

  ngOnInit(): void {}

  doAction() {}
}
