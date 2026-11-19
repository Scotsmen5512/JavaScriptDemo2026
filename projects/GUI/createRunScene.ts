import { Vector3 } from "@babylonjs/core";
import type { SceneData } from "./interfaces";

export default function createRunScene(runScene: SceneData) {
  const requiredPickups = 5;
  let collected = 0;

  const hud = document.createElement("section");
  hud.className = "trail-hud";
  hud.setAttribute("aria-label", "Trail progress and controls");
  hud.innerHTML = `
    <div class="trail-heading">
      <div class="trail-brand"><span class="trail-mark">4</span><div><strong>Trail Game</strong><small>BY EVAN MONTGOMERY</small></div></div>
      <div class="pickup-counter" aria-live="polite"><span class="pickup-icon">✿</span><span id="pickup-count">0 / ${requiredPickups}</span></div>
    </div>
    <div class="trail-tip"><strong id="trail-status">Find all the mushrooms</strong><span>WASD / arrows to move - Space to jump</span></div>
    <div class="trail-finish" id="trail-finish" role="status" aria-live="polite">
      <span class="finish-sparkle">4</span><p class="finish-kicker">TRAIL COMPLETE</p>
      <h1>A lovely little haul.</h1><p>You found every mushroom and made it to the clearing.</p>
      <button id="trail-restart" type="button">Explore again <span>↻</span></button>
    </div>
  `;
  document.body.appendChild(hud);

  const pickupCount = hud.querySelector<HTMLElement>("#pickup-count");
  const status = hud.querySelector<HTMLElement>("#trail-status");
  const finish = hud.querySelector<HTMLElement>("#trail-finish");
  hud.querySelector<HTMLButtonElement>("#trail-restart")?.addEventListener("click", () => {
    window.location.reload();
  });

  runScene.scene.onAfterRenderObservable.add(() => {
    const farmer = runScene.farmer;
    if (!farmer) return;
    const playerPosition = farmer.getAbsolutePosition();

    runScene.collectibles?.forEach((collectible) => {
      if (!collectible.mesh.isEnabled()) return;
      if (Vector3.DistanceSquared(playerPosition, collectible.position) > 2.6 ** 2) return;
      collectible.mesh.setEnabled(false);
      collectible.marker?.setEnabled(false);
      collected += 1;
      if (pickupCount) pickupCount.textContent = `${collected} / ${requiredPickups}`;
    });

    if (requiredPickups > 0 && collected === requiredPickups) {
      if (status) status.textContent = "All found — head to the clearing!";
      const finishPosition = new Vector3(0, 0, 22);
      if (Vector3.DistanceSquared(playerPosition, finishPosition) < 5 ** 2) {
        finish?.classList.add("is-visible");
      }
    } else if (status) {
      status.textContent = `Find all the mushrooms · ${requiredPickups - collected} to go`;
    }
  });

  runScene.scene.onDisposeObservable.addOnce(() => hud.remove());
}