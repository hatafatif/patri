# Patri

Live Pakistan Railways train tracker. Vanilla JS ES modules in `public/`, with no build step for the app itself. Run it locally with `npm start` (http://localhost:8787). Planned work is in `ROADMAP.md`.

## Frontend: build only from components

All frontend UI is built from the registered component library, in the Sabz look. This applies to every agent working in this repo: the main session, orchestrators and builders.

- **Where the library lives:**
  - `docs/COMPONENTS.md` is the registry and spec. Read it before writing any UI.
  - `public/js/components/` holds one module per component. `index.js` is the code registry.
  - `public/css/components.css` holds component styles. They use only the tokens in `public/css/tokens.css`.
  - `design-system/tokens.json` is the single source of the tokens. `public/css/tokens.css` is generated from it with `npm run ds`; never edit the CSS by hand.
  - `design-system/components/<Name>/` holds each component's guidelines (`README.md`) and live preview (`preview.html`). Together they form the library page, "Patri Components": https://claude.ai/artifact/4ApeuZwGi3rveuSHQD9VUf
  - `/components.html` is the in-app gallery of every component.
- **Before writing any UI, check the registry.** If a component fits, use it, adding a variant through its props if needed.
  - Don't write one-off markup or CSS for something a component already covers.
  - Don't put raw colours, font sizes or spacing in views. Use tokens.
- **If no component fits, stop and confirm with the user first.** Propose the name, purpose, props and the screens that will use it. After approval:
  1. Build it in `public/js/components/`.
  2. Add its styles to `components.css`.
  3. Register it in `index.js` and in `docs/COMPONENTS.md`.
  4. Add `design-system/components/<Name>/` and republish the library page.
  5. Only then use it.
- **Subagents can't ask the user,** so they must not invent components. A builder that needs one stops and reports the proposal to whoever launched it, and that session asks the user.
- **Pages compose components; they don't define new UI pieces.** Views in `public/js/views/` wire data to components and contain layout only.
- **Views render their pages through the screen templates in `public/js/screens/`** (`docs/COMPONENTS.md`, "Screens"). These are built only from components, and the map stand-in there is for previews only.
- **Product rules:**
  - Never filter or sort trains by lateness.
  - The Home and Station maps show stations, plus a small marker for every running train (the owner's call, 2026-10-21). The Train page map follows its one train.
  - Urdu uses Noto Nastaliq Urdu everywhere.

## Pipeline for changes to the app

- Larger changes run through two agent roles defined in `.claude/agents/`:
  - **patri-orchestrator** (Opus, xhigh effort) plans the work, splits it, and briefs the builders.
  - **patri-builder** (Sonnet, high effort) implements one brief each.
- The main session brainstorms with the user first, then hands the agreed brief to the orchestrator.
- Nothing is committed or deployed unless the user asks.
