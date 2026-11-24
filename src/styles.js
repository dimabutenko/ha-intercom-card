// Card CSS. The card draws its own wall panel (light plastic body, colour LCD),
// so it looks the same in light and dark Home Assistant themes. The panel itself is
// the card: ha-card is stripped of its background, border, shadow and padding so
// no container is visible, and its clipping is lifted so the ring glow is not cut off.
export const STYLES = `
:host { display: block; }
ha-card {
  display: block; background: none; border: none; box-shadow: none; border-radius: 0; padding: 0; overflow: visible;
}
* { box-sizing: border-box; margin: 0; }
button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; padding: 0; -webkit-tap-highlight-color: transparent; }
svg { width: 1em; height: 1em; fill: currentColor; display: block; }

.unit {
  --amber: #ffb020; --blue: #4f9dff; --green: #3ecf8e; --red: #ff5a5f;
  width: 100%; margin: 0; padding: 16px; border-radius: 26px; color: #333;
  background: linear-gradient(160deg, #f1eee6, #d6d2c6);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.7), inset 0 -3px 6px rgba(0,0,0,.18), 0 10px 24px rgba(0,0,0,.35);
  font-family: var(--paper-font-body1_-_font-family, Roboto, "Segoe UI", Arial, sans-serif);
  transition: box-shadow .2s;
}
.unit.ring { box-shadow: inset 0 2px 0 rgba(255,255,255,.7), 0 0 0 3px var(--amber), 0 0 36px rgba(255,176,32,.55); }

/* ---- LCD ---- */
.lcd {
  --fg: #7dffb0; --bg: #17241d;
  height: 360px; display: flex; flex-direction: column; padding: 10px 12px; border-radius: 12px;
  background: var(--bg); color: var(--fg); font-family: Consolas, "SF Mono", "Roboto Mono", monospace;
  box-shadow: inset 0 3px 8px rgba(0,0,0,.8), 0 0 0 3px #a6a194; position: relative; overflow: hidden;
  transition: background .2s, color .2s;
}
.ring .lcd { --fg: #ffd27a; --bg: #2f230b; }
.courier .lcd { --fg: #9ccaff; --bg: #10243a; }
.offline .lcd { --fg: #ff9a9d; --bg: #2e1517; }

.hd { display: flex; align-items: center; justify-content: space-between; font-size: 11px; opacity: .85; }
.hd-r { display: flex; align-items: center; gap: 8px; }
.sig { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
.sig i { width: 3px; background: currentColor; border-radius: 1px; }
.sig i.off { opacity: .25; }
.gear { width: 20px; height: 20px; font-size: 16px; border-radius: 5px; opacity: .8; }
.gear:hover, .gear.on { opacity: 1; background: rgba(255,255,255,.12); }

.st { font-size: 16px; font-weight: 700; margin: 6px 0 8px; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ring .st { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: .45; } }

.tabs { display: flex; gap: 4px; margin-bottom: 6px; }
.tab { font-size: 11px; padding: 3px 8px; border-radius: 6px; border: 1px solid currentColor; opacity: .55; }
.tab.on { opacity: 1; background: var(--fg); color: var(--bg); font-weight: 700; }

.list { flex: 1; min-height: 0; overflow-y: auto; border-top: 1px dashed currentColor; padding-top: 5px; scrollbar-width: thin; scrollbar-color: currentColor transparent; }
.day { font-size: 10.5px; opacity: .55; letter-spacing: .1em; text-transform: uppercase; padding: 5px 4px 2px; }
.it { display: grid; grid-template-columns: 20px 1fr auto; gap: 8px; align-items: center; width: 100%; text-align: left; font-size: 12.5px; padding: 4px; border-radius: 4px; }
.it:hover { background: rgba(255,255,255,.07); }
.it svg { font-size: 16px; }
.it .tm { opacity: .7; font-size: 11.5px; }
.it.now { background: rgba(255,210,122,.22); font-weight: 700; }
.det { font-size: 11px; opacity: .65; padding: 0 4px 4px 32px; }
.empty { opacity: .6; text-align: center; padding: 40px 0; font-size: 12px; }

.ft { font-size: 10px; opacity: .6; text-align: center; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.settings { position: absolute; inset: 0; background: var(--bg); padding: 10px 12px; display: none; flex-direction: column; gap: 6px; }
.settings.on { display: flex; }
.settings .row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,.18); }
.settings .ttl { font-size: 14px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.pill { font-size: 11px; padding: 3px 10px; border-radius: 10px; border: 1px solid currentColor; opacity: .7; }
.pill.on { opacity: 1; background: var(--fg); color: var(--bg); font-weight: 700; }

/* ---- keys ---- */
.keys { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 18px; }
.k { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: #555; text-align: center; }
.btn {
  width: 58px; height: 58px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px;
  background: linear-gradient(#f7f5ef, #cfcabe); box-shadow: 0 4px 0 #a9a498, 0 6px 8px rgba(0,0,0,.3); color: #444;
  transition: transform .06s, box-shadow .06s, opacity .2s;
}
.btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #a9a498, 0 2px 4px rgba(0,0,0,.3); }
.btn.big { width: 84px; height: 84px; font-size: 38px; }
.btn.green { background: linear-gradient(#5be3a5, #27a06a); box-shadow: 0 4px 0 #1b7a50, 0 6px 8px rgba(0,0,0,.3); color: #fff; }
.btn.red { background: linear-gradient(#ff8084, #d03b40); box-shadow: 0 4px 0 #9e2a2e, 0 6px 8px rgba(0,0,0,.3); color: #fff; }
.btn:disabled { opacity: .4; cursor: default; }
.ring .btn.big:not(:disabled) { animation: pulse 1s infinite; }
@keyframes pulse { 50% { transform: scale(1.07); } }

/* ---- toggles ---- */
.sec { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; padding-top: 12px; border-top: 2px groove #cfcabd; }
.tg { display: flex; align-items: center; gap: 10px; text-align: left; background: rgba(0,0,0,.07); border-radius: 12px; padding: 8px 10px; font-size: 12px; font-weight: 600; color: #444; }
.tg .led { width: 12px; height: 12px; flex: none; border-radius: 50%; background: #7a7a7a; box-shadow: inset 0 1px 2px rgba(0,0,0,.5); }
.tg small { display: block; font-weight: 400; color: #777; font-size: 10.5px; }
.tg.on { background: rgba(79,157,255,.22); }
.tg.on .led { background: var(--blue); box-shadow: 0 0 8px var(--blue); }
.tg.mute.on { background: rgba(255,176,32,.2); }
.tg.mute.on .led { background: var(--amber); box-shadow: 0 0 8px var(--amber); }
.tg:disabled { opacity: .45; cursor: default; }
.hidden { display: none !important; }
`;
