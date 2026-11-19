import {
  Color3,
  CubeTexture,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

export default function createSpaceSkybox(scene: Scene) {
  const spaceTexture = CubeTexture.CreateFromImages(
    [
      "./assets/space_left.jpg",
      "./assets/space_up.jpg",
      "./assets/space_front.jpg",
      "./assets/space_right.jpg",
      "./assets/space_down.jpg",
      "./assets/space_back.jpg",
    ],
    scene,
  );
  spaceTexture.coordinatesMode = Texture.SKYBOX_MODE;

  const skybox = MeshBuilder.CreateBox("spaceSkybox", { size: 1000 }, scene);
  skybox.infiniteDistance = true;

  const skyboxMaterial = new StandardMaterial("spaceSkyboxMaterial", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.disableLighting = true;
  skyboxMaterial.diffuseColor = Color3.Black();
  skyboxMaterial.specularColor = Color3.Black();
  skyboxMaterial.reflectionTexture = spaceTexture;
  skybox.material = skyboxMaterial;

  return skybox;
}