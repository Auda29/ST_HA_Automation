/**
 * ST for Home Assistant - Frontend Entry Point
 */
import designSystemCss from "./colors_and_type.css?inline";
export * from "./editor";
import "./panel/st-panel";

const existingDesignSystem = document.getElementById("st-ha-design-system");
if (!existingDesignSystem) {
  const style = document.createElement("style");
  style.id = "st-ha-design-system";
  style.textContent = designSystemCss;
  document.head.appendChild(style);
}

console.log("ST for Home Assistant loaded");
