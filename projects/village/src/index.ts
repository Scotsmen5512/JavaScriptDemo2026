import { Engine } from "@babylonjs/core";
import createStartScene from "./createStartScene";
import createRunScene from "./createRunScene";
//import { ShowInspector } from "@babylonjs/inspector";

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.width = 1200;   // Set internal resolution
canvas.height = 800;

canvas.classList.add("background-canvas");
document.getElementById("3d")?.appendChild(canvas);

let eng = new Engine(canvas, true, {}, true);
let startScene = createStartScene(eng);
createRunScene(startScene);

eng.runRenderLoop(() => {
  startScene.scene.render();
});     
//ShowInspector(startScene);