// Intercom card — a wall intercom panel for an ESPHome "Domofon" device: a colour
// LCD with live status and the history of rings, code entries and door/gate
// openings, big keys (open door, gate, reject) and courier-mode / mute toggles.
// Entry point of the sources in src/; `npm run build` bundles it into the single
// intercom-card.js, which CI attaches to each GitHub release (what HACS installs). Modules:
//   card.js      the card element (wires Home Assistant state to the markup)
//   history.js   recorder history -> list of events
//   editor.js    the visual config editor
//   template.js  markup, styles.js CSS, icons.js inline SVG icons
//   entities.js  entity roles and their ids derived from `prefix`
//   i18n/        translations (en.js, ru.js) + language resolution
//
// Config:
//   type: custom:intercom-card
//   prefix: domofon          # entity_id prefix shared by the device's entities
//   name: Intercom           # optional title on the screen
//   language: en | ru        # optional; default follows the Home Assistant language
//   history_days: 7          # optional, 1-30
//   entities:                # optional, overrides the by-convention ids
//     ring, code_entry, door, gate, reject, courier, mute, antenna, wifi

import { IntercomCard } from "./card.js";
import { IntercomCardEditor } from "./editor.js";

customElements.define("intercom-card-editor", IntercomCardEditor);
customElements.define("intercom-card", IntercomCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "intercom-card",
  name: "Intercom Card",
  description: "Wall intercom panel: live status on a colour LCD with the history of rings, codes and openings, keys for the door and gate, courier mode and mute.",
  preview: true,
  documentationURL: "https://github.com/dimabutenko/ha-intercom-card",
});
