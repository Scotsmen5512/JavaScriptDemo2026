import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Engine,
  StandardMaterial,
  Texture,
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
    { diameter: 3, segments: 32 },
    scene,
  );
  sphere.position.y = 0;
  const material = new StandardMaterial("earthMaterial", scene);
  const earthTexture = new Texture("./assets/Planets/Earth.jpg", scene);
  material.diffuseTexture = earthTexture;
  sphere.material = material;
  sphere.rotation.x = Math.PI;
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
  createOrbitingMoons(sceneData.scene, 1, 2, 0.00035, new Color3(0.65, 0.85, 1));
  sceneData.camera = createArcRotateCamera(sceneData.scene);
  return sceneData;
}