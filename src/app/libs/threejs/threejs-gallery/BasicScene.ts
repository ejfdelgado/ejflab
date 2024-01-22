import { MyConstants } from 'srcJs/MyConstants';
import * as THREE from 'three';
//import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export interface ItemModelRef {
  url: string;
  name: string;
}

export class BasicScene extends THREE.Scene {
  // A dat.gui class debugger that is added by default
  //debugger: GUI = null;
  // Setups a scene camera
  camera: THREE.PerspectiveCamera | null = null;
  // setup renderer
  renderer: THREE.Renderer | null = null;
  // setup Orbitals
  orbitals: OrbitControls | null = null;
  // Holds the lights for easy reference
  lights: Array<THREE.Light> = [];
  // Number of PointLight objects around origin
  lightCount: number = 6;
  // Distance above ground place
  lightDistance: number = 3;
  // Get some basic params
  bounds: DOMRect;
  // FBX loader
  fbxLoader = new FBXLoader();
  lastObject: any = null;

  canvasRef: HTMLCanvasElement;
  constructor(canvasRef: any, bounds: DOMRect) {
    super();
    this.canvasRef = canvasRef;
    this.bounds = bounds;
  }
  /**
   * Initializes the scene by adding lights, and the geometry
   */
  initialize(debug: boolean = true, addGridHelper: boolean = true) {
    // setup camera
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.bounds.width / this.bounds.height,
      0.1,
      1000
    );
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;
    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef,
      alpha: true,
    });
    this.renderer.setSize(this.bounds.width, this.bounds.height);
    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
    this.add(new THREE.AxesHelper(3));
    // set the background color
    this.background = new THREE.Color(0xefefef);

    const light = new THREE.AmbientLight(0xefefef, 2);
    const hemiLight = new THREE.HemisphereLight(0xefefef, 0xefefef, 2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);

    this.add(directionalLight);
    this.add(light);
    //this.add(hemiLight);
  }
  /**
   * Given a ThreeJS camera and renderer, resizes the scene if the
   * browser window is resized.
   * @param camera - a ThreeJS PerspectiveCamera object.
   * @param renderer - a subclass of a ThreeJS Renderer object.
   */
  setBounds(bounds: DOMRect) {
    this.bounds = bounds;
    if (this.camera == null || this.renderer == null) {
      return;
    }
    this.camera.aspect = this.bounds.width / this.bounds.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.bounds.width, this.bounds.height);
  }

  fitCameraToSelection(
    camera: any,
    controls: any,
    selection: any,
    fitOffset = 1.2
  ) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const box = new THREE.Box3();

    box.makeEmpty();
    for (const object of selection) {
      box.expandByObject(object);
    }

    box.getSize(size);
    box.getCenter(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
      maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = controls.target
      .clone()
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);

    controls.maxDistance = distance * 10;
    controls.target.copy(center);

    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(controls.target).sub(direction);

    controls.update();
  }

  disableBackFaceCullingDoubleSide(model: any) {
    model.traverse(function (node: any) {
      if (node.isMesh) {
        node.material.side = THREE.DoubleSide;
      }
    });
  }

  async addFBXModel(item: ItemModelRef): Promise<void> {
    // Remove previous model
    if (this.lastObject != null) {
      this.remove(this.lastObject);
    }
    return new Promise((resolve, reject) => {
      const url = `${MyConstants.SRV_ROOT}${item.url.replace(/^\//g, '')}`;
      this.fbxLoader.load(
        url,
        (object) => {
          this.lastObject = object;
          this.disableBackFaceCullingDoubleSide(object);
          this.add(object);
          this.fitCameraToSelection(this.camera, this.orbitals, [object]);
          resolve();
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
}
