import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { HttpService } from './http.service';

export interface SolvePnPData {
  v2: Array<Array<number>>;
  v3: Array<Array<number>>;
  size: Array<Array<number>>;
  focal: Array<Array<number>>;
  aux?: Array<Array<number>>;
  rvec?: Array<Array<number>>;
  tvec?: Array<Array<number>>;
  t?: Array<Array<number>>;
  points3d?: Array<Array<number>>;
  points2d?: Array<Array<number>>;
}

@Injectable({
  providedIn: 'root',
})
export class OpenCVService {
  constructor(
    private modalService: ModalService,
    private httpService: HttpService
  ) {}

  //await OpenCVService.solvePnP({"v2": [[282, 274], [397, 227], [577, 271], [462, 318], [270, 479], [450, 523], [566, 475]], "v3": [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]]});
  async solvePnP(payload: SolvePnPData): Promise<SolvePnPData | null> {
    const options = {
      showIndicator: true,
    };
    const response = await this.httpService.post<SolvePnPData>(
      `srv/opencv/solvepnp`,
      { payload },
      options
    );
    return response;
  }
}
