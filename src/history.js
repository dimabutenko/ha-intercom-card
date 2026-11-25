// Event history from the recorder (WebSocket `history/history_during_period`).
//
// What the intercom exposes and what we make of it:
//   ring        binary_sensor, "on" for the length of a call      -> "ring" (with duration)
//   code_entry  binary_sensor, "on" while a code is being typed   -> "code" (the code itself is not exposed)
//   door/gate/  ESPHome buttons: the state is the time of the last -> "door" / "gate" / "reject"
//   reject      press, so every press is a state change
//   courier     switch                                            -> "courier_on" / "courier_off", and
//                                                                     "offline" / "online" (unavailable <-> any)
// Who pressed a button (card, Telegram, courier mode) is not recorded anywhere.

const MAX_EVENTS = 300;

function rowMs(row) {
  const v = row.lc ?? row.lu;
  if (typeof v === "number") return v * 1000;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
}

// The first row of every series is the state at the start of the window, not a
// change inside it.
function changes(rows, startMs) {
  return (rows || [])
    .map((r, i) => ({ s: r.s ?? r.state, ms: rowMs(r), first: i === 0 }))
    .filter((r) => r.ms !== null)
    .map((r) => ({ ...r, inside: !(r.first && r.ms - startMs < 2000) }));
}

// "on" intervals of a binary sensor -> [{ms, durationMs|null}]
function pulses(rows, startMs) {
  const out = [];
  let open = null;
  for (const r of changes(rows, startMs)) {
    if (r.s === "on") {
      if (r.inside) {
        open = { ms: r.ms, durationMs: null };
        out.push(open);
      }
    } else if (open) {
      open.durationMs = r.ms - open.ms;
      open = null;
    }
  }
  return out;
}

export function parseHistory(result, entities, startMs) {
  const rows = (role) => (entities[role] ? result[entities[role]] : null);
  const events = [];

  for (const p of pulses(rows("ring"), startMs)) events.push({ kind: "ring", ...p });
  for (const p of pulses(rows("code_entry"), startMs)) events.push({ kind: "code", ...p });

  for (const role of ["door", "gate", "reject"]) {
    const seen = new Set();
    for (const r of changes(rows(role), startMs)) {
      const ms = Date.parse(r.s); // a button's state is its last-press timestamp
      if (Number.isNaN(ms) || ms < startMs || seen.has(ms)) continue;
      seen.add(ms);
      events.push({ kind: role, ms });
    }
  }

  // Courier mode: only a real on <-> off change counts. A return from "unavailable"
  // (the device dropped off the network) is not the mode being switched. The same
  // series gives the device going offline / back online (the ring sensor stands in
  // when there is no courier switch).
  let prev = null;
  for (const r of changes(rows("courier") || rows("ring"), startMs)) {
    const was = prev;
    prev = r.s;
    if (!r.inside || was === null) continue;
    if (r.s === "unavailable") {
      if (was !== "unavailable") events.push({ kind: "offline", ms: r.ms });
    } else if (was === "unavailable") {
      events.push({ kind: "online", ms: r.ms });
    } else if (entities.courier && r.s !== was && (r.s === "on" || r.s === "off")) {
      events.push({ kind: r.s === "on" ? "courier_on" : "courier_off", ms: r.ms });
    }
  }

  return events.sort((a, b) => b.ms - a.ms).slice(0, MAX_EVENTS);
}

export async function loadEvents(hass, entities, days) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const ids = ["ring", "code_entry", "door", "gate", "reject", "courier"].map((r) => entities[r]).filter(Boolean);
  if (!ids.length) return [];
  const result = await hass.callWS({
    type: "history/history_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    entity_ids: ids,
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  return parseHistory(result || {}, entities, start.getTime());
}
