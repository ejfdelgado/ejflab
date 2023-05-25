import * as THREE from 'three';
//import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { BufferAttribute, Camera, Object3D } from 'three';
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export class BasicScene extends THREE.Scene {
  PRECISION = 2;
  MARKER_SIZE = 0.1;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.Renderer | null = null;
  orbitals: OrbitControls | null = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 6;
  lightDistance: number = 3;
  bounds: DOMRect;
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  pickableObjects: THREE.Mesh[] = [];
  intersectedObject: THREE.Object3D | null;

  normalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  highlightedMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x00ff00,
  });

  canvasRef: HTMLCanvasElement;
  constructor(canvasRef: any, bounds: DOMRect) {
    super();
    this.canvasRef = canvasRef;
    this.bounds = bounds;
  }

  update(): void {
    if (!this.camera) {
      return;
    }
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.pickableObjects);

    let intersectedEl = null;
    if (intersects.length > 0) {
      intersectedEl = intersects[0];
      this.intersectedObject = intersectedEl.object;
    } else {
      this.intersectedObject = null;
    }
    this.pickableObjects.forEach((o: THREE.Mesh, i) => {
      if (this.intersectedObject && this.intersectedObject.name === o.name) {
        this.pickableObjects[i].material = this.highlightedMaterial;
      } else {
        this.pickableObjects[i].material = this.normalMaterial;
      }
    });
  }

  onMouseMove(event: MouseEvent, bounds: DOMRect) {
    if (!this.renderer) {
      return;
    }
    this.mouse.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
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

  addCubeVertex(point: THREE.Vector3) {
    const key = [
      point.x.toFixed(this.PRECISION),
      point.y.toFixed(this.PRECISION),
      point.z.toFixed(this.PRECISION),
    ].join(',');
    const geometry = new THREE.BoxGeometry(
      this.MARKER_SIZE,
      this.MARKER_SIZE,
      this.MARKER_SIZE
    );
    const generatedName = `DOT_${key}`;
    const found = this.getObjectByName(generatedName);
    if (!found) {
      const cube = new THREE.Mesh(geometry, this.normalMaterial);
      cube.name = generatedName;
      cube.position.set(point.x, point.y, point.z);
      this.pickableObjects.push(cube);
      this.add(cube);
    }
  }

  explodeMeshVertex(mesh: THREE.Mesh) {
    // Iterate vertex
    const point = new THREE.Vector3();
    const positionAttribute: any = mesh.geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
      point.fromBufferAttribute(positionAttribute, i);
      mesh.localToWorld(point);
      this.addCubeVertex(point);
    }
  }

  addObjectLocal(object: THREE.Group) {
    for (let i = 0; i < object.children.length; i++) {
      const child = object.children[i];
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        this.explodeMeshVertex(mesh);
      }
    }

    this.add(object);
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
          this.addObjectLocal(object);
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
