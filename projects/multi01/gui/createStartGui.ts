import { ArcRotateCamera, Engine, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { type GuiData } from "../interfaces";

function createSceneButton(
  scene: Scene,
  name: string,
  note: string,
  index: number,
  x: string,
  y: string,
  advtex: AdvancedDynamicTexture,
  setSceneIndex: (index: number) => void,
) {
  let button = Button.CreateSimpleButton(name, note);
  button.left = x;
  button.top = y;
  button.width = "80px";
  button.height = "30px";
  button.color = "white";
  button.cornerRadius = 20;
  button.background = "purple";

  button.onPointerUpObservable.add(function () {
    console.log("Button {index} has been clicked");
    setSceneIndex(index - 1);
  });
  advtex.addControl(button);
  return button;
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
  camera.attachControl(false);
  return camera;
}

export default function createStartGui(
  engine: Engine,
  setSceneIndex: (index: number) => void,
) {
  let guiData: GuiData = { scene: new Scene(engine) };
  guiData.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
    "myUI",
    true,
    guiData.scene,
  );
  guiData.button1 = createSceneButton(
    guiData.scene,
    "but1",
    "Earth",
    1,
    "-150px",
    "350px",
    guiData.advancedTexture,
    setSceneIndex,
  );
  guiData.button2 = createSceneButton(
    guiData.scene,
    "but2",
    "Mars",
    2,
    "-50px",
    "350px",
    guiData.advancedTexture,
    setSceneIndex,
  );
  guiData.button3 = createSceneButton(
    guiData.scene,
    "but3",
    "Jupiter",
    3,
    "50px",
    "350px",
    guiData.advancedTexture,
    setSceneIndex,
  );
  guiData.button4 = createSceneButton(
    guiData.scene,
    "but4",
    "Saturn",
    4,
    "150px",
    "350px",
    guiData.advancedTexture,
    setSceneIndex,
  );
  guiData.camera = createArcRotateCamera(guiData.scene);

  return guiData;
}