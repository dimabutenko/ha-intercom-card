// Entity roles of the intercom and how their ids are derived from `prefix`.
// These are the entities the ESPHome "Domofon" device exposes; any of them can
// be overridden in the card config (`entities:`), and missing ones are simply
// left out of the card.
export const ENTITY_FIELDS = [
  { name: "ring", domain: "binary_sensor", suffix: "doorbell_ring" },
  { name: "code_entry", domain: "binary_sensor", suffix: "code_entry" },
  { name: "door", domain: "button", suffix: "open_door" },
  { name: "gate", domain: "button", suffix: "open_gate" },
  { name: "reject", domain: "button", suffix: "reject_call" },
  { name: "courier", domain: "switch", suffix: "courier_mode" },
  { name: "mute", domain: "switch", suffix: "mute" },
  { name: "antenna", domain: "switch", suffix: "external_antenna" },
  { name: "wifi", domain: "sensor", suffix: "wifi_signal" },
];

export function defaultEntities(prefix) {
  if (!prefix) return {};
  return Object.fromEntries(ENTITY_FIELDS.map((f) => [f.name, `${f.domain}.${prefix}_${f.suffix}`]));
}
