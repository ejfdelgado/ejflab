import * as THREE from 'three';
//import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export class BasicScene extends THREE.Scene {
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.Renderer | null = null;
  orbitals: OrbitControls | null = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 6;
  lightDistance: number = 3;
  bounds: DOMRect;

  canvasRef: HTMLCanvasElement;
  constructor(canvasRef: any, bounds: DOMRect) {
    super();
    this.canvasRef = canvasRef;
    this.bounds = bounds;
  }

  // await this.loadObjMtl('/assets/3d/mycube/mycube.obj', '/assets/3d/mycube/mycube.mtl');
  async loadObjMtl(pathObj: string, pathMtl: string) {
    return new Promise((resolve, reject) => {
      const mtlLoader = new MTLLoader();
      mtlLoader.load(
        pathMtl,
        async (materials) => {
          materials.preload();
          try {
            const model = await this.loadObj(pathObj, materials);
            resolve(model);
          } catch (err) {
            reject(err);
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  //await this.loadObj('/assets/3d/mycube/mycube.obj');
  async loadObj(path: string, materials?: MTLLoader.MaterialCreator) {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader();
      if (materials) {
        loader.setMaterials(materials);
      }
      loader.load(
        path,
        (object) => {
          this.add(object);
          resolve(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
          reject(error);
        }
      );
    });
  }

  initialize(debug: boolean = true, addGridHelper: boolean = true) {
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.bounds.width / this.bounds.height,
      0.1,
      1000
    );
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef,
      alpha: true,
    });
    this.renderer.setSize(this.bounds.width, this.bounds.height);
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);

    if (addGridHelper) {
      this.add(new THREE.GridHelper(10, 10, 'red'));
      this.add(new THREE.AxesHelper(3));
    }

    this.background = new THREE.Color(0xefefef);

    for (let i = 0; i < this.lightCount; i++) {
      const light = new THREE.PointLight(0xffffff, 1);
      let lightX =
        this.lightDistance * Math.sin(((Math.PI * 2) / this.lightCount) * i);
      let lightZ =
        this.lightDistance * Math.cos(((Math.PI * 2) / this.lightCount) * i);
      light.position.set(lightX, this.lightDistance, lightZ);
      light.lookAt(0, 0, 0);
      this.add(light);
      this.lights.push(light);
      this.add(new THREE.PointLightHelper(light, 0.5, 0xff9900));
    }

    this.loadObjMtl(
      '/assets/3d/mycube/mycube.obj',
      '/assets/3d/mycube/mycube.mtl'
    );
  }

  setBounds(bounds: DOMRect) {
    this.bounds = bounds;
    if (this.camera == null || this.renderer == null) {
      return;
    }
    this.camera.aspect = this.bounds.width / this.bounds.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.bounds.width, this.bounds.height);
  }
}
