import { buildTemplate } from "./template.js";
import { STYLES } from "./styles.js";
import { icon } from "./icons.js";
import { defaultEntities } from "./entities.js";
import { loadEvents } from "./history.js";
import { resolveLanguage, makeTranslator } from "./i18n/index.js";

const FLASH_MS = 3000;
const HISTORY_DEBOUNCE_MS = 400;
const OPEN_KINDS = ["door", "gate"];
const FILTER_KINDS = {
  all: null,
  ring: ["ring", "reject"],
  code: ["code"],
  open: OPEN_KINDS,
};

export class IntercomCard extends HTMLElement {
  setConfig(config) {
    if (!config.prefix && !config.entities) {
      throw new Error("intercom-card: set `prefix` (or an explicit `entities` map)");
    }
    // Empty overrides (a UI entity picker left blank) fall back to the prefix-derived id.
    const overrides = Object.fromEntries(Object.entries(config.entities || {}).filter(([, v]) => v));
    const days = Math.min(30, Math.max(1, parseInt(config.history_days, 10) || 7));
    this._config = {
      name: config.name || null,
      language: config.language || null,
      days,
      entities: { ...defaultEntities(config.prefix), ...overrides },
    };
    this._filter = "all";
    this._events = null;
    this._open = new Set();
    this._watch = null;
    this._lang = null;
    if (this._built) {
      this._built = false;
      if (this._hass) this.hass = this._hass;
    }
  }

  getCardSize() {
    return 9;
  }

  static getStubConfig() {
    return { type: "custom:intercom-card", prefix: "domofon" };
  }

  static getConfigElement() {
    return document.createElement("intercom-card-editor");
  }

  set hass(hass) {
    this._hass = hass;
    const lang = resolveLanguage(this._config.language, hass);
    if (!this._built || lang !== this._lang) {
      this._lang = lang;
      this._t = makeTranslator(lang);
      this._build();
    }
    this._update();
  }

  connectedCallback() {
    if (this._built) this._startClock();
  }

  disconnectedCallback() {
    this._stopClock();
    clearTimeout(this._historyTimer);
  }

  _startClock() {
    this._stopClock();
    this._clock = setInterval(() => this._hass && this._updateStatus(), 1000);
  }

  _stopClock() {
    if (this._clock) clearInterval(this._clock);
    this._clock = null;
  }

  _build() {
    const root = this.shadowRoot || this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${STYLES}</style>${buildTemplate(this._t)}`;
    this._root = root;
    this._built = true;
    this._settingsOpen = false;
    root.addEventListener("click", (ev) => this._onClick(ev));
    this._watch = null; // reload the history in the new language
    this._startClock();
  }

  // ---- entity helpers ----
  _id(role) {
    return this._config.entities[role];
  }

  _state(role) {
    const id = this._id(role);
    return id ? this._hass.states[id] : undefined;
  }

  _is(role, value) {
    return this._state(role)?.state === value;
  }

  _num(role) {
    const n = parseFloat(this._state(role)?.state);
    return Number.isFinite(n) ? n : null;
  }

  // ---- actions ----
  _onClick(ev) {
    const filter = ev.target.closest("[data-filter]");
    if (filter) {
      this._filter = filter.dataset.filter;
      this._renderTabs();
      this._renderList();
      return;
    }
    const row = ev.target.closest("[data-row]");
    if (row) {
      const key = row.dataset.row;
      this._open.has(key) ? this._open.delete(key) : this._open.add(key);
      this._renderList();
      return;
    }
    const btn = ev.target.closest("[data-act]");
    if (!btn || btn.disabled) return;
    const act = btn.dataset.act;
    if (act === "settings") {
      this._settingsOpen = !this._settingsOpen;
      this._root.querySelector(".settings").classList.toggle("on", this._settingsOpen);
    } else if (act === "door" || act === "gate" || act === "reject") {
      this._hass.callService("button", "press", { entity_id: this._id(act) });
      this._flash = { kind: act, until: Date.now() + FLASH_MS };
      this._updateStatus();
    } else if (act === "courier" || act === "mute" || act === "antenna") {
      this._hass.callService("switch", "toggle", { entity_id: this._id(act) });
    }
  }

  // ---- live state ----
  _view() {
    const available = (role) => {
      const s = this._state(role);
      return !!s && s.state !== "unavailable";
    };
    const online = available("ring") || available("door") || available("courier");
    return {
      online,
      ring: this._is("ring", "on"),
      code: this._is("code_entry", "on"),
      courier: this._is("courier", "on"),
      mute: this._is("mute", "on"),
      antenna: this._is("antenna", "on"),
    };
  }

  _update() {
    const v = this._view();
    const root = this._root;
    const $ = (sel) => root.querySelector(sel);
    const unit = $(".unit");
    unit.classList.toggle("ring", v.online && v.ring);
    unit.classList.toggle("courier", v.online && !v.ring && v.courier);
    unit.classList.toggle("offline", !v.online);

    // Hide what the config/device does not have.
    for (const [role, sel] of [["reject", '[data-act="reject"]'], ["gate", '[data-act="gate"]'], ["door", '[data-act="door"]']]) {
      $(sel).closest(".k").classList.toggle("hidden", !this._id(role));
    }
    $(".tg.courier").classList.toggle("hidden", !this._id("courier"));
    $(".tg.mute").classList.toggle("hidden", !this._id("mute"));
    $(".settings .ant").classList.toggle("hidden", !this._id("antenna"));
    $(".sec").classList.toggle("hidden", !this._id("courier") && !this._id("mute"));

    // The intercom opens the door, the gate and rejects only during a call.
    for (const act of ["door", "gate", "reject"]) $(`[data-act="${act}"]`).disabled = !(v.online && v.ring);

    const t = this._t;
    const tg = (sel, on, hint) => {
      const el = $(sel);
      el.classList.toggle("on", on);
      el.querySelector("small").textContent = hint;
      el.disabled = !v.online;
    };
    tg(".tg.courier", v.courier, v.courier ? t("toggles.courier_on") : t("toggles.courier_off"));
    tg(".tg.mute", v.mute, v.mute ? t("toggles.mute_on") : t("toggles.mute_off"));

    $(".name").textContent = this._config.name || t("name");
    this._renderSignal();
    this._renderConn(v);
    this._renderSettings(v);
    this._updateStatus();
    this._renderTabs();

    // Reload the history whenever any watched entity changed.
    const key = ["ring", "code_entry", "door", "gate", "reject", "courier"]
      .map((r) => `${this._state(r)?.state}|${this._state(r)?.last_changed}`)
      .join(";");
    if (key !== this._watch) {
      const first = this._watch === null;
      this._watch = key;
      this._scheduleHistory(first ? 0 : HISTORY_DEBOUNCE_MS);
    }
  }

  _renderSignal() {
    const dbm = this._num("wifi");
    const bars = dbm === null ? 0 : dbm > -60 ? 4 : dbm > -70 ? 3 : dbm > -80 ? 2 : 1;
    const sig = this._root.querySelector(".sig");
    sig.innerHTML = [4, 7, 10, 12].map((h, i) => `<i class="${i < bars ? "" : "off"}" style="height:${h}px"></i>`).join("");
    sig.title = dbm === null ? "" : `${dbm} dBm`;
  }

  // Green dot in the header: the intercom is on the network. Red: it is not.
  _renderConn(v) {
    this._root.querySelector(".conn").title = v.online ? this._t("settings.online") : this._t("settings.offline");
  }

  _renderSettings(v) {
    const t = this._t;
    const $ = (sel) => this._root.querySelector(sel);
    const ant = $('.pill[data-act="antenna"]');
    ant.classList.toggle("on", v.antenna);
    ant.textContent = v.antenna ? "ON" : "OFF";
    ant.disabled = !v.online;
    const dbm = this._num("wifi");
    $(".settings .wifi").textContent = dbm === null ? "—" : `${dbm} dBm`;
    $(".settings .dev").textContent = v.online ? t("settings.online") : t("settings.offline");
    $(".settings .days").textContent = t("settings.history_days", { n: this._config.days });
  }

  _updateStatus() {
    const t = this._t;
    const v = this._view();
    const $ = (sel) => this._root.querySelector(sel);
    let text;
    let hint = t("hint.list");
    if (this._flash && Date.now() < this._flash.until) {
      text = t(`status.${this._flash.kind}`);
    } else if (!v.online) {
      text = t("status.offline");
    } else if (v.ring) {
      const since = Date.parse(this._state("ring").last_changed);
      const n = Math.max(0, Math.round((Date.now() - since) / 1000));
      text = t("status.ring", { n });
      hint = t("hint.ring");
    } else if (v.code) {
      text = t("status.code");
    } else if (v.courier) {
      text = t("status.courier");
      hint = t("hint.courier");
    } else {
      text = t("status.ready");
    }
    $(".st").textContent = text;
    $(".ft").textContent = hint;
  }

  // ---- history ----
  _scheduleHistory(delay) {
    clearTimeout(this._historyTimer);
    this._historyTimer = setTimeout(() => this._loadHistory(), delay);
  }

  async _loadHistory() {
    try {
      this._events = await loadEvents(this._hass, this._config.entities, this._config.days);
      this._historyError = false;
    } catch (e) {
      this._historyError = true;
      if (!this._events) this._events = [];
      console.warn("intercom-card: cannot load history", e);
    }
    this._renderList();
  }

  _renderTabs() {
    this._root.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.filter === this._filter));
  }

  _dayLabel(ms) {
    const t = this._t;
    const d = new Date(ms);
    const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((start(new Date()) - start(d)) / 86400000);
    if (diff === 0) return t("days.today");
    if (diff === 1) return t("days.yesterday");
    return d.toLocaleDateString(this._lang, { day: "numeric", month: "short" });
  }

  _renderList() {
    const list = this._root.querySelector(".list");
    if (!list) return;
    const t = this._t;
    const kinds = FILTER_KINDS[this._filter];
    const events = (this._events || []).filter((e) => !kinds || kinds.includes(e.kind));
    if (!events.length) {
      list.innerHTML = `<div class="empty">${this._events === null ? "…" : t("empty", { n: this._config.days })}</div>`;
      return;
    }
    const scroll = list.scrollTop;
    const ringOn = this._is("ring", "on");
    let day = null;
    let html = "";
    for (const e of events) {
      const label = this._dayLabel(e.ms);
      if (label !== day) {
        day = label;
        html += `<div class="day">${label}</div>`;
      }
      const key = `${e.kind}-${e.ms}`;
      const live = e.kind === "ring" && ringOn && e.durationMs === null;
      const time = live ? t("now") : new Date(e.ms).toLocaleTimeString(this._lang, { hour: "2-digit", minute: "2-digit", hour12: false });
      html += `<button class="it${live ? " now" : ""}" data-row="${key}">${icon(e.kind === "courier_on" || e.kind === "courier_off" ? "courier" : e.kind)}<span>${t(`events.${e.kind}`)}</span><span class="tm">${time}</span></button>`;
      if (this._open.has(key)) html += `<div class="det">${this._detail(e, live)}</div>`;
    }
    list.innerHTML = html;
    list.scrollTop = scroll;
  }

  _detail(e, live) {
    const t = this._t;
    const full = new Date(e.ms).toLocaleString(this._lang, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    if (live) return `${full} · ${t("detail.ongoing")}`;
    if (e.durationMs != null) return `${full} · ${t("detail.lasted", { n: Math.round(e.durationMs / 1000) })}`;
    return full;
  }
}
