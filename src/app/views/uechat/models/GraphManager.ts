import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FlowChartDiagram } from 'srcJs/FlowChartDiagram';
import { SimpleObj } from 'srcJs/SimpleObj';
import { ModelManager } from './ModelManager';

export abstract class GraphManager extends ModelManager {
  graphHtml: string = '';
  getGraph(sanitizer: DomSanitizer): any {
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
    const svgContent = FlowChartDiagram.computeGraph(
      grafo,
      currentNodes,
      history
    );
    return sanitizer.bypassSecurityTrustHtml(svgContent);
  }
  graphRecomputeBoundingBox(mySvgRef: ElementRef) {
    setTimeout(() => {
      if (mySvgRef) {
        const svg = mySvgRef.nativeElement;
        var bbox = svg.getBBox();
        // Update the width and height using the size of the contents
        svg.setAttribute('width', bbox.x + bbox.width + bbox.x);
        svg.setAttribute('height', bbox.y + bbox.height + bbox.y);
      }
    });
    return true;
  }
  updateGraphFromModel(sanitizer: DomSanitizer, mySvgRef: ElementRef): void {
    this.graphHtml = this.getGraph(sanitizer);
    this.graphRecomputeBoundingBox(mySvgRef);
  }
}
