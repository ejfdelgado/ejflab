import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PayupopupComponent } from 'src/app/components/payupopup/payupopup.component';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { HttpService } from './http.service';

export interface SecretsReadData {
  key: Array<string>;
}

export interface SecretsWriteData {
  [key: string]: string | null;
}

export interface SecretListData {
  key: string;
  val: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PayuService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    public dialog: MatDialog,
    private httpService: HttpService
  ) {}

  async loadSecrets(payload: SecretsReadData): Promise<SecretsWriteData> {
    const response = await this.httpService.post<Array<SecretListData>>(
      `srv/sec/r`,
      payload,
      {
        showIndicator: true,
      }
    );
    if (response == null) {
      throw new Error('No se puede realizar la consulta.');
    }
    const ans: SecretsWriteData = {};
    for (let i = 0; i < response.length; i++) {
      const actual = response[i];
      if (actual) {
        ans[actual.key] = actual.val;
      }
    }
    return ans;
  }

  async saveSecrets(payload: SecretsWriteData) {
    const response = await this.httpService.post<any>(
      `srv/sec/w`,
      { map: payload },
      {
        showIndicator: true,
      }
    );
    console.log(response);
  }

  async getPubKey(payload: any) {
    const response = await this.httpService.post<any>(`srv/sec/pub`, payload, {
      showIndicator: true,
    });
    console.log(response);
  }

  async openConfiguration() {
    try {
      const oldValues = await this.loadSecrets({
        key: [
          'payu_api_key',
          'payu_api_login',
          'payu_pub_key',
          'payu_account_id',
          'payu_merchant_id',
        ],
      });
      const dialogRef = this.dialog.open(PayupopupComponent, {
        data: oldValues,
      });
      return new Promise((resolve) => {
        dialogRef.afterClosed().subscribe((result) => {
          resolve(result);
        });
      });
    } catch (err: any) {
      this.modalService.alert({ txt: err.message });
    }
  }
}
