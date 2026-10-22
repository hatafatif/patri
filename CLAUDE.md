# Patri

Live Pakistan Railways train tracker. Vanilla JS ES modules in `public/`, with no build step for the app itself. Run it locally with `npm start` (http://localhost:8787).
- Planned work is in `ROADMAP.md`.
- Server operations are in `deploy/oracle/README.md`.

This file records how we work, not what we decided. Individual decisions live in the code and the git history, so read them from there.

## How we make decisions

- **The owner decides; Claude proposes.** The owner owns the product, the look and the wording.
- **Feedback arrives in batches, often mid-task.**
  - Track every item, settle the open questions with the owner, then build.
  - Report back one line per item: what's done and what's left.
- **Ask with concrete options and your recommendation first** (AskUserQuestion, with previews for visual choices). Don't ask what the code or a sensible default already answers.
- **Explain anything new and systemic before building it,** such as a server, notifications or a new data source. Cover how it would work, what it costs and the trade-offs. Build once the owner says go.
- **Always ask first** before:
  - a new component;
  - anything that costs money or puts a hold on a card;
  - anything outward-facing: pushing, merging, deploying, DNS.
- **Hosting stays at $0.**
  - Prefer free tiers.
  - Keep the load on our own servers small: read from the upstream feed wherever it works.
- **Verify before asserting.** Check the docs and the live system rather than going from memory. When the owner pushes back, check again before answering.
- **Answer in plain words.**

## Orchestrator and builders

- **The main session is the orchestrator** (Opus, xhigh). It works through the decisions with the owner, then:
  1. splits the work;
  2. writes the briefs;
  3. reviews and integrates what comes back;
  4. checks it in the running app.

  The `patri-orchestrator` agent remains for handing off a whole job.
- **Builders are `patri-builder` on Sonnet at medium effort.** Make briefs simple enough for that: exact files, code for the tricky parts, and exact checks.
  - Do the shared and taste-heavy work first, yourself: tokens, strings in both languages, helpers and tricky maths. Builders should never write Urdu or invent values.
  - Give parallel builders disjoint files.
- **Parallel builders run in worktrees** (`isolation: "worktree"`).
  - Worktrees start from `main`, not the current branch. Commit the foundation to the feature branch, and make step 0 of each brief `git reset --hard <branch>`.
  - Use `git -C` and absolute paths rather than `cd` into a worktree.
- **Subagent sandboxes have no network.** Do downloads in the main session and hand builders local files.
- **Subagents can't ask the owner.** A builder that hits an open question, such as a missing component, stops and reports a proposal. The main session takes it to the owner.

## Reuse before building

All UI is built from the registered component library. This applies to every agent in this repo.

- **Where things live:**
  - `docs/COMPONENTS.md` is the registry and spec. Read it before writing any UI.
  - `public/js/components/` holds one module per component, with `index.js` as the code registry. Their styles are in `public/css/components.css`.
  - `design-system/tokens.json` is the single source of the tokens. `npm run ds` generates `public/css/tokens.css` from it; never edit that CSS by hand.
  - `design-system/components/<Name>/` holds each component's guidelines and preview. Together they form the library page, "Patri Components": https://claude.ai/artifact/4ApeuZwGi3rveuSHQD9VUf
  - `/components.html` is the in-app gallery.
- **Layers:**
  - Views (`public/js/views/`) wire data to screens.
  - Screens (`public/js/screens/`) lay out components.
  - Components draw the UI.

  Pages compose; they never define new UI pieces.
- **Reach for a variant before a new component.** Add a prop to an existing component (a size, a label, a tone) when that covers the need.
- **Reuse the shared helpers.** Don't re-solve what they already do in a view:
  - time and name formatting: `public/js/screens/_format.js`;
  - icons: `public/js/components/_shared.js`;
  - strings: `public/js/i18n.js`.
- **No one-off markup or CSS,** and no raw colours, font sizes or spacing. Use tokens.
- **If nothing fits, stop and propose a new component to the owner:** its name, purpose, props and the screens that use it. Once approved:
  1. Build it in `public/js/components/`.
  2. Add its styles to `components.css`.
  3. Register it in `index.js` and `docs/COMPONENTS.md`.
  4. Add `design-system/components/<Name>/` and republish the library page.
  5. Only then use it.

## How the UI should look

- **Phone first.** Most riders are on phones with mobile data. Keep downloads small and the core job, "where's my train", a tap or two away.
- **Sabz look, from tokens only.**
- **Clear hierarchy.** What the rider came for (speed, delay, the next stop) is big, strong data. Labels are quiet. Don't shrink key facts into pills or small print.
- **Rider language.** Use plain words, never technical ones ("GPS", raw IDs, "+1"). Every string goes through `t()` with both `en` and `ur`.
- **Show what the rider can act on,** and leave out what they can't use.
- **Never filter or sort trains by lateness.**
- **Urdu is first-class:**
  - Noto Nastaliq Urdu everywhere, including Urdu words on English pages;
  - Latin text inside Urdu keeps its Latin font;
  - the same hierarchy as English, using the `urdu-*` type tokens for Nastaliq's taller lines.
- **Navigation is always within reach.** Home, back and search stay reachable on every page, on phones as much as on the web.
- **Lively, not bland.** Colour, relief and a small, playful animation are welcome as long as they don't compete with the data.
- **Accessible:**
  - real `<button>` and `<a>` elements;
  - aria-labels on icon-only controls;
  - 44px tap targets and a visible focus ring;
  - logical CSS properties, so right-to-left layouts mirror.
- **Check it in the running app before calling it done.** Take screenshots at phone and desktop widths, in English and Urdu.
  - Chrome's `--screenshot` captures the MapLibre map blank.
  - For map checks, drive Chromium over CDP (`--remote-debugging-port`, `--use-angle=swiftshader --enable-unsafe-swiftshader`) and wait about 7 s before capturing.

## Secrets

The repo is public.
- **Never read, print or paste a secret value:**
  - the files `.env`, `.env.local` and the VM's `/etc/patri/recorder.env`;
  - API keys, the recorder key, the archive URL, the VAPID keys and SSH private keys.
- **To check a secret,** test its shape (prefix, length, line count) without echoing it.
- **The owner runs** SSH commands and deploys that touch secrets themselves. Give them the command, and have them paste values through `read -rs`.
- **CI never prints secrets.** A local, uncommitted `.git/hooks/pre-push` blocks pushes that contain secrets. Never bypass it with `--no-verify`.

## Shipping

- **Nothing is committed, pushed, merged or deployed unless the owner asks.**
  - Work lands through PRs: `gh pr create`, then `gh pr merge <n> --merge --delete-branch` on the owner's go-ahead.
  - `main` deploys the site to Vercel. The recorder's files go to the VM through `.github/workflows/deploy-monitor.yml`.
- **A new server file** goes into `FILES` in `deploy/oracle/deploy.sh` and into the workflow's `paths`. Otherwise it never reaches the VM.
- **The VM is shared with the owner's other projects.** Setup only adds; it never removes another project's config.
- **After a merge, check the live site and the recorder's `/healthz`.** Vercel can take about 10 minutes and has skipped a push once. An empty commit re-triggers it.
