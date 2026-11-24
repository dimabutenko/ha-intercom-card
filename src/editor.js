import { LANGUAGES, resolveLanguage, makeTranslator } from "./i18n/index.js";
import { ENTITY_FIELDS } from "./entities.js";

// UI config editor via HA's own <ha-form>: prefix, title, language, history
// length and every entity override in a collapsed "Entity overrides" section.
// An override left empty falls back to the `prefix`-derived default (the card's
// setConfig drops empty entries before merging).

export class IntercomCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _schema(t) {
    return [
      { name: "prefix", selector: { text: {} } },
      { name: "name", selector: { text: {} } },
      { name: "history_days", selector: { number: { min: 1, max: 30, mode: "box" } } },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: t("editor.language_auto") },
              ...Object.entries(LANGUAGES).map(([value, l]) => ({ value, label: l.meta.name })),
            ],
          },
        },
      },
      {
        name: "entities",
        type: "expandable",
        title: t("editor.entities"),
        schema: ENTITY_FIELDS.map(({ name, domain }) => ({ name, selector: { entity: { domain } } })),
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = { ...ev.detail.value };
        if (!value.language) delete value.language; // "auto" = no key
        if (!value.name) delete value.name;
        this._config = value;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const t = makeTranslator(resolveLanguage(this._config.language, this._hass));
    this._form.hass = this._hass;
    this._form.data = { language: "", history_days: 7, ...this._config };
    this._form.schema = this._schema(t);
    this._form.computeLabel = (s) => t(`editor.${s.name}`);
  }
}
