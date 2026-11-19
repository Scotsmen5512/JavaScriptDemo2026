//import "@babylonjs/core/Debug/debugLayer";
//import "@babylonjs/inspector";
import { getHavok } from "./havok";
import {
  Scene,
  ArcRotateCamera,
  AssetsManager,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Engine,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Color3,
  Color4,
  StandardMaterial,
  MeshAssetTask,
  DirectionalLight,
  TransformNode,
} from "@babylonjs/core";
import type { SceneData } from "./interfaces";


function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.85;
  const sun = new DirectionalLight("sun", new Vector3(-0.4, -1, 0.3), scene);
  sun.intensity = 0.65;
  return light;
}

function createGround(scene: Scene) {
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 38, height: 80 },
    scene
  );
  ground.position.z = -9;
  const groundMaterial = new StandardMaterial("forest-ground", scene);
  groundMaterial.diffuseColor = new Color3(0.24, 0.38, 0.2);
  groundMaterial.specularColor = new Color3(0.05, 0.05, 0.05);
  ground.material = groundMaterial;
  const groundAggregate = new PhysicsAggregate(
    ground,
    PhysicsShapeType.BOX,
    { mass: 0 },
    scene
  );
  return groundAggregate;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 3.1,
    camDist = 15,
    camTarget = new Vector3(0, 1, -20);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 22;
  camera.lowerBetaLimit = 0.35;
  camera.upperBetaLimit = Math.PI / 2.1;
  camera.wheelPrecision = 45;
  camera.attachControl(true);
  return camera;
}

function addTrail(scene: Scene) {
  const pathMaterial = new StandardMaterial("trail-dirt", scene);
  pathMaterial.diffuseColor = new Color3(0.38, 0.29, 0.18);
  pathMaterial.specularColor = new Color3(0.03, 0.03, 0.03);

  const trail = [
    { x: 0, z: -19, angle: 0.02 },
    { x: 0, z: -15, angle: 0.02 },
    { x: 0.8, z: -11, angle: 0.1 },
    { x: 1.4, z: -7, angle: 0.08 },
    { x: 0.8, z: -3, angle: -0.12 },
    { x: -0.4, z: 1, angle: -0.16 },
    { x: -1.2, z: 5, angle: -0.08 },
    { x: -0.6, z: 9, angle: 0.12 },
    { x: 0.2, z: 13, angle: 0.12 },
    { x: 0, z: 17, angle: -0.02 },
    { x: 0, z: 21, angle: 0 },
  ];

  trail.forEach(({ x, z, angle }, index) => {
    const segment = MeshBuilder.CreateGround(
      `trail-segment-${index}`,
      { width: 3.3, height: 4.5 },
      scene
    );
    segment.position.set(x, 0.025, z);
    segment.rotation.y = angle;
    segment.material = pathMaterial;
  });

  const clearing = MeshBuilder.CreateCylinder(
    "destination-clearing",
    { diameter: 9, height: 0.08, tessellation: 48 },
    scene
  );
  clearing.position.set(0, 0.04, 22);
  clearing.material = pathMaterial;

  const gateMaterial = new StandardMaterial("clearing-gate", scene);
  gateMaterial.diffuseColor = new Color3(0.61, 0.48, 0.27);
  gateMaterial.emissiveColor = new Color3(0.08, 0.06, 0.025);
  const leftPost = MeshBuilder.CreateBox("clearing-gate-left", { width: 0.65, height: 3.2, depth: 0.65 }, scene);
  const rightPost = MeshBuilder.CreateBox("clearing-gate-right", { width: 0.65, height: 3.2, depth: 0.65 }, scene);
  const crossBeam = MeshBuilder.CreateBox("clearing-gate-beam", { width: 7.4, height: 0.6, depth: 0.7 }, scene);
  leftPost.position.set(-3.4, 1.6, 22);
  rightPost.position.set(3.4, 1.6, 22);
  crossBeam.position.set(0, 3.1, 22);
  leftPost.material = gateMaterial;
  rightPost.material = gateMaterial;
  crossBeam.material = gateMaterial;
}

function addAssets(scene: Scene, sceneData: SceneData) {
  const assetsManager = new AssetsManager(scene);
  const naturePath = "./assets/nature/glTF/";

  const addStaticCollider = (name: string, x: number, z: number, radius: number) => {
    const trunk = MeshBuilder.CreateCylinder(
      `${name}-collider`,
      { height: 5, diameter: radius * 2, tessellation: 8 },
      scene
    );
    trunk.position.set(x, 2.5, z);
    trunk.isVisible = false;
    new PhysicsAggregate(trunk, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
  };

  const addAssetInstances = (
    model: string,
    placements: Array<{ x: number; z: number; scale?: number; rotation?: number }>,
    isTree = false
  ) => {
    const task = assetsManager.addMeshTask(
      `${model} task`,
      "",
      naturePath,
      `${model}.gltf`
    );
    task.onSuccess = (loadedTask) => {
      const source = loadedTask.loadedMeshes[0];
      const firstPlacement = placements[0];
      if (!source || !firstPlacement) return;
      source.position.set(firstPlacement.x, 0, firstPlacement.z);
      source.scaling.setAll(firstPlacement.scale ?? 1);
      source.rotation.y = firstPlacement.rotation ?? 0;
      if (isTree) {
        addStaticCollider(`${model}-0`, firstPlacement.x, firstPlacement.z, 0.55);
      }

      placements.slice(1).forEach((placement, index) => {
        const clone = source.clone(`${model}-instance-${index + 1}`, null);
        if (!clone) return;
        clone.position.set(placement.x, 0, placement.z);
        clone.scaling.setAll(placement.scale ?? 1);
        clone.rotation.y = placement.rotation ?? 0;
        if (isTree) {
          addStaticCollider(
            `${model}-${index + 1}`,
            placement.x,
            placement.z,
            0.55
          );
        }
      });
    };
  };

  addAssetInstances("CommonTree_1", [
    { x: -12, z: -17, scale: 1.1 }, { x: 12, z: -14, scale: 0.9 },
    { x: -13, z: -5, scale: 0.85 }, { x: 12, z: 5, scale: 1.05 },
    { x: -12, z: 15, scale: 0.95 },
  ], true);
  addAssetInstances("CommonTree_2", [
    { x: 12, z: -20, scale: 0.95 }, { x: -11, z: -11, scale: 1.05 },
    { x: 13, z: 1, scale: 0.9 }, { x: -12, z: 9, scale: 1.1 },
    { x: 11, z: 17, scale: 0.9 },
  ], true);
  addAssetInstances("CommonTree_3", [
    { x: -8, z: -21, scale: 0.85 }, { x: 8, z: -8, scale: 1.1 },
    { x: -9, z: 3, scale: 1 }, { x: 8, z: 13, scale: 0.9 },
  ], true);
  addAssetInstances("Pine_2", [
    { x: 16, z: -9, scale: 0.9 }, { x: -16, z: 1, scale: 0.95 },
    { x: 16, z: 11, scale: 1.05 },
  ], true);
  addAssetInstances("DeadTree_2", [
    { x: -16, z: -14, scale: 0.9 }, { x: 16, z: 20, scale: 1.05 },
  ], true);
  addAssetInstances("Bush_Common_Flowers", [
    { x: -4, z: -14, scale: 0.8 }, { x: 5, z: -9, scale: 0.9 },
    { x: -5, z: -2, scale: 0.85 }, { x: 5, z: 4, scale: 0.9 },
    { x: -5, z: 11, scale: 1 }, { x: 4, z: 17, scale: 0.85 },
  ]);
  addAssetInstances("Fern_1", [
    { x: -3.4, z: -17, scale: 0.8 }, { x: 4, z: -12, scale: 1 },
    { x: -4, z: -6, scale: 0.9 }, { x: 4, z: 0, scale: 1.1 },
    { x: -4, z: 7, scale: 0.9 }, { x: 3.5, z: 14, scale: 1 },
  ]);
  addAssetInstances("Flower_3_Group", [
    { x: -7, z: -18, scale: 0.8 }, { x: 7, z: -4, scale: 0.9 },
    { x: -7, z: 8, scale: 1 }, { x: 7, z: 19, scale: 0.85 },
  ]);
  addAssetInstances("Rock_Medium_1", [
    { x: -3.2, z: -8, scale: 0.65 }, { x: 3.3, z: -1, scale: 0.75 },
    { x: 3.2, z: 10, scale: 0.7 }, { x: -3.5, z: 18, scale: 0.8 },
  ]);
  addAssetInstances("RockPath_Round_Small_1", [
    { x: 0, z: -17, scale: 0.8 }, { x: 0.4, z: -9, scale: 0.8 },
    { x: -0.5, z: -1, scale: 0.85 }, { x: 0.3, z: 7, scale: 0.8 },
    { x: 0, z: 15, scale: 0.85 }, { x: 0, z: 20, scale: 0.8 },
  ]);
  addAssetInstances("RockPath_Round_Small_2", [
    { x: 0.5, z: -13, scale: 0.8 }, { x: 0.3, z: -5, scale: 0.85 },
    { x: -0.4, z: 3, scale: 0.8 }, { x: -0.2, z: 11, scale: 0.85 },
    { x: 0.1, z: 18, scale: 0.8 },
  ]);
  addAssetInstances("Grass_Common_Tall", [
    { x: -6, z: -15, scale: 1.2 }, { x: 7, z: -11, scale: 1.1 },
    { x: -7, z: -3, scale: 1.2 }, { x: 6, z: 2, scale: 1.1 },
    { x: -6, z: 12, scale: 1.15 }, { x: 7, z: 16, scale: 1.2 },
  ]);

  const mushroomTask: MeshAssetTask = assetsManager.addMeshTask(
    "mushroom collectibles task",
    "",
    naturePath,
    "Mushroom_Common.gltf"
  );
  const mushroomLocations = [
    new Vector3(-1.8, 0, -13),
    new Vector3(2.2, 0, -6),
    new Vector3(-1.8, 0, 2),
    new Vector3(1.5, 0, 10),
    new Vector3(0, 0, 18),
  ];
  mushroomTask.onSuccess = (task) => {
    const source = task.loadedMeshes[0];
    if (!source) return;
    mushroomLocations.forEach((position, index) => {
      const mushroom = index === 0
        ? source
        : source.clone(`mushroom-pickup-${index + 1}`, null);
      if (!mushroom) return;
      mushroom.position.copyFrom(position);
      mushroom.scaling.setAll(0.75);
      const marker = MeshBuilder.CreateTorus(
        `mushroom-marker-${index + 1}`,
        { diameter: 1.15, thickness: 0.055, tessellation: 24 },
        scene
      );
      marker.position.set(position.x, 0.08, position.z);
      marker.rotation.x = Math.PI / 2;
      const markerMaterial = new StandardMaterial(`mushroom-marker-material-${index + 1}`, scene);
      markerMaterial.diffuseColor = new Color3(0.94, 0.76, 0.38);
      markerMaterial.emissiveColor = new Color3(0.38, 0.22, 0.06);
      marker.material = markerMaterial;
      sceneData.collectibles?.push({ mesh: mushroom, position: position.clone(), marker });
    });
  };

  const farmer:MeshAssetTask = assetsManager.addMeshTask(
    "farmer task",
    "",
    "./assets/men/",
    "Farmer.gltf"
  );
  farmer.onSuccess = function (task) {
    const root = task.loadedMeshes[0];
    const farmerPivot = new TransformNode("farmer-pivot", scene);
    root!.parent = farmerPivot;
    sceneData.farmer = farmerPivot;
    if (sceneData.camera instanceof ArcRotateCamera) {
      sceneData.camera.lockedTarget = farmerPivot;
    }
    sceneData.farmerIdleAnimation = task.loadedAnimationGroups.find(
      (animationGroup) => animationGroup.name === "Idle"
    );
    sceneData.farmerWalkAnimation = task.loadedAnimationGroups.find(
      (animationGroup) => animationGroup.name === "Walk"
    );
    sceneData.farmerIdleAnimation?.start(true);
  };

  assetsManager.onTaskErrorObservable.add(function (task) {
    console.log(
      "task failed",
      task.errorObject.message,
      task.errorObject.exception
    );
  });
  return assetsManager;
}


export default async function createStartScene(engine: Engine) {
  const that: SceneData = { scene: new Scene(engine), collectibles: [] };
  that.scene.clearColor = new Color4(0.62, 0.79, 0.83, 1);
  const hk = await getHavok();
  that.scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, hk));
  
  //that.scene.debugLayer.show();

  that.light = createLight(that.scene);
  that.ground = createGround(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  addTrail(that.scene);
  const assetsManager = addAssets(that.scene, that);
  assetsManager.load();
  return that;
}