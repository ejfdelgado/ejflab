import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileSaveResponseData, FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { TupleService } from 'src/services/tuple.service';
import { WebcamService } from 'src/services/webcam.service';
import { IdGen } from 'srcJs/IdGen';
import { ModuloDatoSeguroFront } from 'srcJs/ModuloDatoSeguroFront';
import { MyConstants } from 'srcJs/MyConstants';
import { BaseComponent } from 'src/app/components/base/base.component';
import { AudioOptionsData } from 'src/app/mycommon/components/audioeditor/audioeditor.component';
import { BlobOptionsData } from 'src/app/mycommon/components/blobeditor/blobeditor.component';
import { ImagepickerOptionsData } from 'src/app/mycommon/components/imagepicker/imagepicker.component';
import { TxtOptionsData } from 'src/app/mycommon/components/txtfileeditor/txtfileeditor.component';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
})
export class CvComponent extends BaseComponent implements OnInit, OnDestroy {
  imageOptions: ImagepickerOptionsData = {
    isEditable: true,
    isRounded: false,
    useBackground: false,
    useRoot: MyConstants.SRV_ROOT,
    autosave: true,
    defaultFileName: 'miImagen.jpg',
  };
  textOptions: TxtOptionsData = {
    height: '200px',
    maxHeight: '200px',
    useRoot: MyConstants.SRV_ROOT,
  };
  blobOptions: BlobOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    autosave: true,
  };
  audioOptions: AudioOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    canCut: true,
    canDownload: true,
    canUpload: true,
    canDelete: true,
    canSave: true,
    showWaveForm: true,
  };
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService,
    public override fileService: FileService,
    public override modalService: ModalService,
    public override webcamService: WebcamService
  ) {
    super(
      route,
      pageService,
      cdr,
      authService,
      dialog,
      tupleService,
      fileService,
      modalService,
      webcamService
    );
  }

  override onTupleReadDone() {
    if (!this.tupleModel.image) {
      this.tupleModel.image = MyConstants.PAGE.NO_IMAGE;
    }
  }

  async saveTextRef(response: FileSaveResponseData) {
    this.tupleModel.txtFile = response.key;
    super.saveTuple();
  }

  async setTime() {
    if (!this.tupleModel) {
      return;
    }
    const tiempo = await IdGen.ahora();
    this.tupleModel.t = [tiempo];
    super.saveTuple();

    const llavePublica =
      '-----BEGIN PUBLIC KEY-----\
MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAM+53jqSLGfawXnrz5rmRs5Beg1XfgXL\
tLAesEEBkicPAgMBAAE=\
-----END PUBLIC KEY-----\
';
    const llavePrivada =
      '-----BEGIN PRIVATE KEY-----\
MIHDAgEAMA0GCSqGSIb3DQEBAQUABIGuMIGrAgEAAiEAz7neOpIsZ9rBeevPmuZG\
zkF6DVd+Bcu0sB6wQQGSJw8CAwEAAQIgBqWK39LnitcsE6ug8/LkVwxprUbTmJGt\
helcnGpk4oECEQDxBmnsnP3xpVW2vK0ceTjBAhEA3KHSeoVNCYmawX5oraMDzwIR\
AKdwJTXS+jdc/GauPDSDogECEQC3G9pqcu1PyBNXGUlZKlzDAhASO74AOK6q8tA2\
1NMvWu5a\
-----END PRIVATE KEY-----';
    const cifrado = ModuloDatoSeguroFront.cifrar(
      { valor: 'edgar' },
      llavePublica
    );
    const decifrado = ModuloDatoSeguroFront.decifrar(cifrado, llavePrivada);
    console.log(decifrado);
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
