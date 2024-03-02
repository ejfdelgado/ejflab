import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FlowChartDiagram } from 'srcJs/FlowChartDiagram';
import { SimpleObj } from 'srcJs/SimpleObj';
import sortify from 'srcJs/sortify';
import { ModelManager } from './ModelManager';

export abstract class GraphManager extends ModelManager {
  mementoCurrent: string = '';
  graphHtml: string = '';
  getGraph(
    sanitizer: DomSanitizer,
    grafo: any,
    currentNodes: Array<any>,
    history: Array<any>
  ): any {
    const svgContent = FlowChartDiagram.computeGraph(
      grafo,
      currentNodes,
      history
    );
    return sanitizer.bypassSecurityTrustHtml(svgContent);
  }
  graphRecomputeBoundingBox(mySvgRef: ElementRef) {
    if (mySvgRef) {
      const svg = mySvgRef.nativeElement;
      var bbox = svg.getBBox();
      // Update the width and height using the size of the contents
      svg.setAttribute('width', bbox.x + bbox.width + bbox.x);
      svg.setAttribute('height', bbox.y + bbox.height + bbox.y);
    }
    return true;
  }
  updateGraphFromModel(
    sanitizer: DomSanitizer,
    mySvgRef: ElementRef,
    forceUpdate: boolean
  ): void {
    // Se valida si realmente algo ha cambiado
    let grafo = SimpleObj.getValue(this.modelState, 'zflowchart');
    if (!grafo) {
      grafo = {};
    }
    let currentNodes = SimpleObj.getValue(this.modelState, 'st.current');
    if (!currentNodes) {
      currentNodes = [];
    }
    let history = SimpleObj.getValue(this.modelState, 'st.history');
    if (!history) {
      history = [];
    }
    const memento = {
      currentNodes,
      history,
      grafo,
    };
    const actualMemento = sortify(memento);
    if (forceUpdate) {
      // Solo actualiza el memento
      this.mementoCurrent = actualMemento;
    } else {
      // Verifica si realmente lo debe actualizar
      if (this.mementoCurrent == actualMemento) {
        // No ha cambiado nada
        return;
      } else {
        //Se asigna el nuevo memento
        this.mementoCurrent = actualMemento;
      }
    }
    this.graphHtml = this.getGraph(sanitizer, grafo, currentNodes, history);
    setTimeout(() => {
      this.graphRecomputeBoundingBox(mySvgRef);
    });
  }
  override resetMe() {
    super.resetMe();
    console.log('Reset GraphManager');
    this.mementoCurrent = '';
  }
}
