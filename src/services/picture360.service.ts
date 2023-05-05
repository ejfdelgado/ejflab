export class Picture360Service {
  static facePositions = {
    pz: { x: 1, y: 1 },
    nz: { x: 3, y: 1 },
    px: { x: 2, y: 1 },
    nx: { x: 0, y: 1 },
    py: { x: 1, y: 0 },
    ny: { x: 1, y: 2 },
  };
  static mimeType: { [key: string]: string } = {
    jpg: 'image/jpeg',
    png: 'image/png',
  };
  static async load360ImageService(globalOptions = {}) {
    const settings = Object.assign(
      {
        cubeRotation: 180,
        interpolation: 'lanczos',
        format: 'jpg',
        size: 200,
        path: '/360cube',
      },
      globalOptions
    );

    const canvas = document.createElement('canvas');
    canvas.classList.add('invisible');
    const ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);

    async function loadImageExternal(file: any) {
      const promesa = new Promise((resolve, reject) => {
        if (!file || !ctx) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.addEventListener('load', async () => {
          const { width, height } = img;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, width, height);

          const respuesta = await processImage(data);
          resolve(respuesta);
        });
        img.src = URL.createObjectURL(file);
      });
      promesa.then(() => {
        document.body.removeChild(canvas);
      });
      return promesa;
    }

    async function processImage(data: ImageData) {
      const promesas = [];
      for (let [faceName, position] of Object.entries(
        Picture360Service.facePositions
      )) {
        promesas.push(renderFace(data, faceName, position));
      }
      const total: any = {};
      const resultado = await Promise.all(promesas);
      for (let i = 0; i < resultado.length; i++) {
        const unResultado: any = resultado[i];
        total[unResultado.k] = unResultado.v;
      }
      return total;
    }

    async function renderFace(data: ImageData, faceName: any, position: any) {
      return new Promise((resolve1, reject1) => {
        const options = {
          data: data,
          face: faceName,
          rotation: (Math.PI * settings.cubeRotation) / 180,
          interpolation: settings.interpolation,
        };

        const worker = new Worker('/assets/workers/convert.js');

        const loadImage = async (algo: any) => {
          if (!ctx) {
            resolve1(null);
            return;
          }
          console.log(algo);
          //{ data: imageData }
          const imageData: any = {};
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          ctx.putImageData(imageData, 0, 0);

          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              resolve,
              Picture360Service.mimeType[settings.format],
              0.95
            );
          });

          /*
          const url = await ModuloArchivos.uploadFile({
            data: blob,
            own: false,
            path: `${settings.path}/${faceName}.${settings.format}`,
          });
          const ans: any = {};
          ans.k = faceName;
          ans.v = url.pub;
          resolve1(ans);
          */
        };

        worker.onmessage = loadImage;
        worker.postMessage(
          Object.assign({}, options, {
            maxWidth: settings.size,
            interpolation: 'linear',
          })
        );
      });
    }

    //const file = await ModuloArchivos.askForFile();
    //return await loadImageExternal(file);
  }
}
