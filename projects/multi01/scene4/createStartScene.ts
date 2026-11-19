import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Engine,
  Texture,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

import { type SceneData } from "../interfaces";
import createSpaceSkybox from "../createSpaceSkybox";
import createOrbitingMoons from "../createOrbitingMoons";

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  return light;
}

function createSphere(scene: Scene) {
  let sphere = MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 5, segments: 32 },
    scene,
  );
  sphere.position.y = 0;
  const material = new StandardMaterial("saturnMaterial", scene);
  material.diffuseTexture = new Texture("./assets/Planets/Saturn.jpg", scene);
  sphere.material = material;
  scene.registerBeforeRender(() => {
    sphere.rotation.y += -0.0001 * scene.getEngine().getDeltaTime();
  });
  return sphere;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene,
  );
  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) {
  let sceneData: SceneData = { scene: new Scene(engine) };

  createSpaceSkybox(sceneData.scene);
  sceneData.light = createLight(sceneData.scene);
  sceneData.sphere = createSphere(sceneData.scene);
  createOrbitingMoons(sceneData.scene, 3, 3, 0.00032, new Color3(0.72, 0.88, 1));
  sceneData.camera = createArcRotateCamera(sceneData.scene);
  return sceneData;
}