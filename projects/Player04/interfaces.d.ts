import {
  Scene,
  Mesh,
  AbstractMesh,
  HemisphericLight,
  ArcRotateCamera,
  PhysicsAggregate,
  TransformNode,
  AnimationGroup,
  Vector3,
} from "@babylonjs/core";

export interface Collectible {
  mesh: AbstractMesh;
  position: Vector3;
  marker?: AbstractMesh;
}

export interface SceneData {
      scene: Scene;
      light?: HemisphericLight;
      ground?: PhysicsAggregate;
      camera?: ArcRotateCamera;
      farmer?: TransformNode;
      farmerIdleAnimation?: AnimationGroup;
      farmerWalkAnimation?: AnimationGroup;
      collectibles?: Collectible[];
}