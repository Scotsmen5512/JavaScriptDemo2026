import { Engine } from "@babylonjs/core";
import createStartScene from "./createStartScene";
import createRunScene from "./createRunScene";
import {createCharacterController} from "./createCharacterController";
//import { ShowInspector } from "@babylonjs/inspector";
import './main.css';

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.width = 1280;
canvas.height = 720;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, {}, true);

async function main() {
  const startScene = await createStartScene(eng);
  createCharacterController(startScene);
  createRunScene(startScene);

  eng.runRenderLoop(() => {
    startScene.scene.render();
  });

  window.addEventListener("resize", () => eng.resize());
}

void main();