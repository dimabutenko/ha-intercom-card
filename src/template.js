import { icon } from "./icons.js";

// Static markup of the card; everything dynamic is filled in by card.js.
export function buildTemplate(t) {
  const tab = (id) => `<button class="tab" data-filter="${id}">${t(`filters.${id}`)}</button>`;
  return `
<ha-card>
<div class="unit">
  <div class="lcd">
    <div class="hd">
      <span class="name"></span>
      <span class="hd-r"><span class="sig"></span><button class="gear" data-act="settings">${icon("gear")}</button></span>
    </div>
    <div class="st"></div>
    <div class="tabs">${["all", "ring", "code", "open"].map(tab).join("")}</div>
    <div class="list"></div>
    <div class="ft"></div>
    <div class="settings">
      <div class="ttl"><span>${t("settings.title")}</span><button class="gear on" data-act="settings">${icon("close")}</button></div>
      <div class="row ant"><span>${t("settings.antenna")}</span><button class="pill" data-act="antenna"></button></div>
      <div class="row"><span>${t("settings.wifi")}</span><span class="wifi"></span></div>
      <div class="row"><span>${t("settings.device")}</span><span class="dev"></span></div>
      <div class="row"><span>${t("settings.history")}</span><span class="days"></span></div>
    </div>
  </div>
  <div class="keys">
    <div class="k"><button class="btn red" data-act="reject">${icon("reject")}</button>${t("buttons.reject")}</div>
    <div class="k"><button class="btn big green" data-act="door">${icon("key")}</button>${t("buttons.door")}</div>
    <div class="k"><button class="btn" data-act="gate">${icon("gate")}</button>${t("buttons.gate")}</div>
  </div>
  <div class="sec">
    <button class="tg courier" data-act="courier"><span class="led"></span><div>${t("toggles.courier")}<small></small></div></button>
    <button class="tg mute" data-act="mute"><span class="led"></span><div>${t("toggles.mute")}<small></small></div></button>
  </div>
</div>
</ha-card>`;
}
