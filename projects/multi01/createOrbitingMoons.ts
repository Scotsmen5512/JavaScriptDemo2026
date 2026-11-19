import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";

export default function createOrbitingMoons(
  scene: Scene,
  moonCount: number,
  orbitRadius: number,
  orbitSpeed: number,
  glowColor: Color3,
) {
  const moonMaterial = new StandardMaterial("moonMaterial", scene);
  moonMaterial.emissiveColor = glowColor;
  moonMaterial.diffuseColor = glowColor;
  moonMaterial.specularColor = Color3.Black();

  const moons = Array.from({ length: moonCount }, (_, index) => {
    const moon = MeshBuilder.CreateSphere(
      `moon${index + 1}`,
      { diameter: 0.28, segments: 16 },
      scene,
    );
    moon.material = moonMaterial;
    return {
      mesh: moon,
      angle: (index * Math.PI * 2) / moonCount,
      radius: orbitRadius + index * 0.55,
      speed: orbitSpeed * (1 + index * 0.25),
    };
  });

  scene.registerBeforeRender(() => {
    const deltaTime = scene.getEngine().getDeltaTime();
    for (const moon of moons) {
      moon.angle += moon.speed * deltaTime;
      moon.mesh.position.set(
        Math.cos(moon.angle) * moon.radius,
        0,
        Math.sin(moon.angle) * moon.radius,
      );
    }
  });

  return moons.map(({ mesh }) => mesh);
}