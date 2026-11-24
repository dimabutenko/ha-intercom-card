import {
  mdiBellRing, mdiDialpad, mdiDoorOpen, mdiGate, mdiHandBackRight, mdiKeyVariant,
  mdiPackageVariantClosed, mdiVolumeOff, mdiVolumeHigh, mdiCog, mdiClose, mdiHistory,
} from "@mdi/js";

// Inline SVG (no dependency on <ha-icon>, so it looks the same everywhere).
const PATHS = {
  ring: mdiBellRing,
  code: mdiDialpad,
  door: mdiDoorOpen,
  gate: mdiGate,
  reject: mdiHandBackRight,
  key: mdiKeyVariant,
  courier: mdiPackageVariantClosed,
  mute: mdiVolumeOff,
  sound: mdiVolumeHigh,
  gear: mdiCog,
  close: mdiClose,
  history: mdiHistory,
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;
}
