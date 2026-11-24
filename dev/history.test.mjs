// Self-check of the history parser: node dev/history.test.mjs
import assert from "node:assert/strict";
import { parseHistory } from "../src/history.js";

const E = { ring: "r", code_entry: "c", door: "d", courier: "k" };
const start = Date.parse("2026-11-17T12:00:00Z");
const sec = (iso) => Date.parse(iso) / 1000;
const result = {
  r: [{ s: "off", lu: start / 1000 }, { s: "on", lu: sec("2026-11-20T10:00:00Z") }, { s: "off", lu: sec("2026-11-20T10:00:20Z") },
      { s: "on", lu: sec("2026-11-24T01:00:00Z") }], // still ringing
  c: [{ s: "on", lu: start / 1000 + 1 }, { s: "off", lu: start / 1000 + 4 }], // mid-pulse at the window start: ignored
  d: [{ s: "2026-11-17T11:10:51Z", lu: start / 1000 }, { s: "2026-11-21T08:00:00Z", lu: sec("2026-11-21T08:00:00Z") }],
  k: [{ s: "off", lu: start / 1000 }, { s: "on", lu: sec("2026-11-22T09:00:00Z") }, { s: "unavailable", lu: sec("2026-11-22T09:05:00Z") }],
};
const ev = parseHistory(result, E, start);
const kinds = ev.map((e) => e.kind);
assert.deepEqual(kinds, ["ring", "courier_on", "door", "ring"]);
assert.equal(ev[3].durationMs, 20000);
assert.equal(ev[0].durationMs, null);
console.log("history parser OK:", kinds.join(", "));
