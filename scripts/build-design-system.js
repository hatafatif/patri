#!/usr/bin/env node
// Builds the Patri design system: `npm run ds`.
//   1. design-system/tokens.json            -> public/css/tokens.css
//   2. public/js/components/index.js        -> design-system/components/bundle.js (one classic script, window.Patri)
//      public/js/screens/index.js           -> the same bundle, as window.Patri.screens
//      public/js/screens/_sample.js         -> the same bundle, as window.Patri.samples
//   3. public/css/components.css, then the
//      screen layout and map stand-in CSS   -> design-system/components/bundle.css
//   4. JSDoc @typedef blocks                -> design-system/components/index.d.ts
// The registry order and groups come from the table in docs/COMPONENTS.md. Screens are not components:
// they stay out of the @ds-bundle header and are listed in SCREEN_PAGES below.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const at = (...p) => path.join(ROOT, ...p);
const rel = p => path.relative(process.cwd(), p);
const COMPONENTS_DIR = at('public', 'js', 'components');
const SCREENS_DIR = at('public', 'js', 'screens');
const OUT_DIR = at('design-system', 'components');
const GROUPS = { shell: 'Shell', input: 'Inputs', data: 'Train & station', map: 'Map' };
// Styles appended to bundle.css after components.css, in this order (missing files are skipped).
const EXTRA_CSS = [at('public', 'css', 'screens.css'), at('public', 'css', 'map-standin.css')];
// The library's screen showcase pages: design-system/components/<folder>/, each rendering
// window.Patri.screens.<fn>(window.Patri.samples.<sample>, { layout }).
const SCREEN_PAGES = [
  { folder: 'HomeScreen', fn: 'HomeScreen', sample: 'home', layout: 'phone' },
  { folder: 'HomeScreenWeb', fn: 'HomeScreen', sample: 'home', layout: 'web' },
  { folder: 'SearchScreen', fn: 'SearchScreen', sample: 'search', layout: 'phone' },
  { folder: 'RouteScreen', fn: 'RouteScreen', sample: 'route', layout: 'phone' },
  { folder: 'TrainScreen', fn: 'TrainScreen', sample: 'train', layout: 'phone' },
  { folder: 'TrainScreenWeb', fn: 'TrainScreen', sample: 'train', layout: 'web' },
  { folder: 'StopsScreen', fn: 'StopsScreen', sample: 'train', layout: 'phone' },
  { folder: 'ReplayScreen', fn: 'ReplayScreen', sample: 'replay', layout: 'phone' },
  { folder: 'StationScreen', fn: 'StationScreen', sample: 'station', layout: 'phone' },
  { folder: 'StationScreenWeb', fn: 'StationScreen', sample: 'station', layout: 'web' },
];
// The library serves the logo from its asset store; previews that render an AppBar point the <img> here.
const LOGO_BLOB = '/_blob/24c020f13cff6319d15f617e8824b35f';

function fail(msg) {
  console.error(`ds: ${msg}`);
  process.exit(1);
}

// "| 12 | StatusChip / StatusStrip | data | … |" -> { name: 'StatusChip', group: 'Train & station' }
function readRegistry() {
  const md = fs.readFileSync(at('docs', 'COMPONENTS.md'), 'utf8');
  const rows = [...md.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(\w+)\s*\|/gm)];
  const list = rows.map(m => ({ n: Number(m[1]), name: m[2].split('/')[0].trim(), group: GROUPS[m[3]] }));
  if (!list.length) fail('no registry table found in docs/COMPONENTS.md');
  for (const c of list) if (!c.group) fail(`unknown kind for ${c.name} in docs/COMPONENTS.md`);
  return list.sort((a, b) => a.n - b.n);
}

// ---------------------------------------------------------------------------------------------
// 1. Tokens
function buildTokens() {
  const tokens = JSON.parse(fs.readFileSync(at('design-system', 'tokens.json'), 'utf8'));
  const value = v => String(v).replace(/\{([\w-]+)\}/g, (_, name) => `var(--${name})`);
  const comment = s => (s ? ` /* ${String(s).replace(/\*\//g, '* /')} */` : '');
  const lines = [];
  const section = (title, list) => {
    lines.push(`  /* ${title} */`);
    for (const tk of list) lines.push(`  --${tk.name}: ${value(tk.value)};${comment(tk.usage)}`);
    lines.push('');
  };

  section('Colour', tokens.color.tokens);

  lines.push('  /* Type families */');
  for (const [name, stack] of Object.entries(tokens.type.families)) lines.push(`  --font-${name}: ${stack};`);
  lines.push('');
  lines.push('  /* Type styles, for component CSS: font: var(--t-label); letter-spacing: var(--t-label-tracking); */');
  const styles = [];
  for (const group of tokens.type.groups) {
    for (const st of group.styles) {
      styles.push(st);
      lines.push(`  --t-${st.name}: ${st.fontWeight} ${st.fontSize}/${st.lineHeight} var(--font-${group.family});${comment(st.usage)}`);
      lines.push(`  --t-${st.name}-tracking: ${st.letterSpacing || 'normal'};`);
    }
  }
  lines.push('');

  section('Spacing', tokens.spacing.tokens);
  section('Radius', tokens.radius.tokens);
  section('Shadow', tokens.shadow.tokens);
  section('Border', tokens.border.tokens);
  lines.pop();

  const classes = styles.map(st => `.t-${st.name} { font: var(--t-${st.name}); letter-spacing: var(--t-${st.name}-tracking); }`);
  const css = `/* GENERATED FILE: do not edit by hand.
 * Built by scripts/build-design-system.js from design-system/tokens.json (${tokens.name} v${tokens.version}).
 * Change the JSON and run \`npm run ds\`. */

:root {
${lines.join('\n')}
}

/* Type styles as utility classes */
${classes.join('\n')}
`;
  const out = at('public', 'css', 'tokens.css');
  fs.writeFileSync(out, css);
  const count = tokens.color.tokens.length + tokens.spacing.tokens.length + tokens.radius.tokens.length
    + tokens.shadow.tokens.length + tokens.border.tokens.length;
  console.log(`ds: ${rel(out)}: ${count} tokens, ${styles.length} type styles`);
}

// ---------------------------------------------------------------------------------------------
// 2. Bundle
async function buildBundle(registry) {
  let esbuild;
  try { esbuild = require('esbuild'); } catch { fail('esbuild is missing: run npm install'); }
  if (!fs.existsSync(path.join(COMPONENTS_DIR, 'index.js'))) {
    console.log('ds: public/js/components/index.js not found yet, skipping the bundle');
    return null;
  }

  // One bundle-only source patch. The logo is not inlined: AppBar references brand/patri-logo.svg.
  const standalone = {
    name: 'patri-standalone',
    setup(build) {
      // t() follows <html lang> in the bundle: the module keeps its language in `lang`, so a
      // function appended to the same module can set it from the document.
      build.onLoad({ filter: /[\\/]public[\\/]js[\\/]i18n\.js$/ }, args => ({
        loader: 'js',
        contents: `${fs.readFileSync(args.path, 'utf8')}
export function __syncLang() {
  try { lang = document.documentElement.lang === 'ur' ? 'ur' : 'en'; } catch {}
}
`,
      }));
    },
  };

  const withScreens = fs.existsSync(path.join(SCREENS_DIR, 'index.js'));
  // Every function is wrapped so t() follows <html lang> at the moment it is called.
  const entry = `
import * as C from './public/js/components/index.js';
${withScreens ? "import * as SC from './public/js/screens/index.js';\nimport { samples } from './public/js/screens/_sample.js';" : ''}
import { __syncLang } from './public/js/i18n.js';
const wrap = mod => {
  const out = {};
  for (const [name, value] of Object.entries(mod)) {
    out[name] = typeof value === 'function' ? function (...args) { __syncLang(); return value.apply(this, args); } : value;
  }
  return out;
};
const api = wrap(C);
${withScreens ? 'api.screens = wrap(SC);\napi.samples = samples;' : ''}
window.Patri = api;
`;
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'Patri', components: registry.map(c => ({ name: c.name })) })} */`;
  const result = await esbuild.build({
    stdin: { contents: entry, resolveDir: ROOT, sourcefile: 'ds-entry.js', loader: 'js' },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    charset: 'ascii',
    legalComments: 'none',
    banner: { js: header },
    plugins: [standalone],
    write: false,
    logLevel: 'silent',
  }).catch(e => fail(`bundle failed:\n${e.message}`));

  let js = result.outputFiles[0].text;
  // The bundle may be inlined in a <script>: these two sequences would end or confuse it.
  js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
  if (!js.startsWith(header + '\n')) fail('bundle header is not on line 1');
  if (/<\/script|<!--/i.test(js)) fail('bundle contains </script or <!--');
  if (/^\s*import[\s{*]|\bimport\(/m.test(js)) fail('bundle still contains an import');
  if (/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/.test(js)) fail('bundle contains network access');

  // Load it in a bare sandbox to check every registered component is on window.Patri.
  const sandbox = { window: {}, document: { documentElement: { lang: 'en', dir: 'ltr' } } };
  try { vm.runInNewContext(js, sandbox); } catch (e) { fail(`bundle does not run standalone: ${e.message}`); }
  const api = sandbox.window.Patri || {};
  const missing = registry.filter(c => typeof api[c.name] !== 'function').map(c => c.name);
  if (missing.length) fail(`window.Patri is missing: ${missing.join(', ')}`);
  if (withScreens) checkScreens(api, sandbox);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, 'bundle.js');
  fs.writeFileSync(out, js);
  const screens = Object.keys(api.screens || {}).filter(n => /^[A-Z]\w*Screen$/.test(n)).length;
  console.log(`ds: ${rel(out)}: ${Object.keys(api).length} exports, ${screens} screens, ${(js.length / 1024).toFixed(1)} KB`);
  return api;
}

// Every screen must render from its frozen sample, in English and in Urdu, at its layout, in the bare
// sandbox: that is what makes the showcase pages buildable.
function checkScreens(api, sandbox) {
  if (!api.screens || !api.samples) fail('window.Patri.screens or window.Patri.samples is missing');
  if (!Object.isFrozen(api.samples)) fail('window.Patri.samples is not frozen');
  for (const page of SCREEN_PAGES) {
    const fn = api.screens[page.fn];
    if (typeof fn !== 'function') fail(`window.Patri.screens.${page.fn} is missing`);
    if (!api.samples[page.sample]) fail(`window.Patri.samples.${page.sample} is missing`);
    for (const lang of ['en', 'ur']) {
      sandbox.document.documentElement.lang = lang;
      sandbox.document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
      let html;
      try { html = fn(api.samples[page.sample], { layout: page.layout }); } catch (e) {
        fail(`${page.fn}(samples.${page.sample}, { layout: '${page.layout}' }) throws in ${lang}: ${e.message}`);
      }
      if (typeof html !== 'string' || !html.includes('p-screen')) fail(`${page.fn} (${page.layout}, ${lang}) did not return a screen`);
      if (/undefined|NaN|\[object Object\]/.test(html)) fail(`${page.fn} (${page.layout}, ${lang}) renders "undefined", "NaN" or "[object Object]"`);
    }
  }
  sandbox.document.documentElement.lang = 'en';
  sandbox.document.documentElement.dir = 'ltr';
}

// ---------------------------------------------------------------------------------------------
// 3. Styles
function copyStyles() {
  const src = at('public', 'css', 'components.css');
  if (!fs.existsSync(src)) fail('public/css/components.css is missing');
  const parts = [src, ...EXTRA_CSS.filter(f => fs.existsSync(f))];
  const css = parts.map(f => {
    const text = fs.readFileSync(f, 'utf8');
    if (/<\/style|<!--/i.test(text)) fail(`${rel(f)} contains </style or <!--`);
    return text;
  }).join('\n');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, 'bundle.css');
  fs.writeFileSync(out, css);
  console.log(`ds: ${rel(out)}: ${parts.map(f => path.basename(f)).join(' + ')}`);
}

// ---------------------------------------------------------------------------------------------
// 4. Types, from the JSDoc in each component module:
//   /** @typedef {object} TrainBadgeProps
//    *  @property {string} number - The train number.
//    *  @property {'sm'|'md'|'lg'} [size='md'] - … */
// Types are written in TypeScript syntax. <Name>Handlers typedefs describe bind<Name> handlers.

// Reads a {…} type with balanced braces starting at s[i] === '{'. Returns [type, nextIndex].
function readBraced(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j).trim(), j + 1];
  }
  return [null, s.length];
}

function parseTypedefs(src, file) {
  const defs = [];
  for (const [, raw] of src.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const text = raw.split('\n').map(l => l.replace(/^\s*\* ?/, '')).join('\n');
    const td = text.match(/@typedef\s*\{\s*object\s*\}\s*(\w+)/i);
    if (!td) {
      // Any other typedef, such as a union, becomes a type alias.
      const k = text.indexOf('@typedef');
      if (k === -1) continue;
      const [type, after] = readBraced(text, text.indexOf('{', k));
      const name = text.slice(after).match(/^\s*(\w+)/)?.[1];
      if (type && name) {
        const doc = text.slice(0, k).replace(/\s+/g, ' ').trim();
        defs.push({ name, alias: type.replace(/import\(\s*['"][^'"]+['"]\s*\)\./g, ''), props: [], doc, file });
      }
      continue;
    }
    const props = [];
    let i = 0;
    while ((i = text.indexOf('@property', i)) !== -1) {
      const open = text.indexOf('{', i);
      const [type, after] = readBraced(text, open);
      const rest = text.slice(after).split(/\n@|\n\s*\n/)[0];
      const m = rest.match(/^\s*(\[[^\]]+\]|[\w.]+)\s*(?:-\s*)?([\s\S]*)$/);
      if (!type || !m) { console.warn(`ds: could not read a @property in ${file}`); i = after; continue; }
      const optional = m[1].startsWith('[');
      const [name, def] = m[1].replace(/^\[|\]$/g, '').split('=');
      props.push({ name: name.trim(), type: type.replace(/import\(\s*['"][^'"]+['"]\s*\)\./g, ''), optional, def: def?.trim(), doc: m[2].replace(/\s+/g, ' ').trim() });
      i = after;
    }
    const doc = text.slice(0, text.indexOf('@typedef')).replace(/\s+/g, ' ').trim();
    defs.push({ name: td[1], props, doc, file });
  }
  return defs;
}

// Exports whose signature doesn't follow the <Name>Props / bind<Name>(root, handlers) pattern.
const SPECIAL = {
  statusTone: "(lateMin: number | null | undefined, opts?: { gps?: boolean }): 'ontime' | 'late' | 'early' | 'nogps'",
  mapPaint: '(): MapPaintResult',
  bindSpeedChart: '(root: Element, points: [number, number][]): () => void',
};

function buildTypes(api) {
  const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.js') && f !== 'index.js' && !f.startsWith('_'));
  const defs = new Map();
  for (const f of files) {
    for (const d of parseTypedefs(fs.readFileSync(path.join(COMPONENTS_DIR, f), 'utf8'), f)) defs.set(d.name, d);
  }
  // The screens' data shapes and options (public/js/screens/*.js).
  const screenFiles = fs.existsSync(SCREENS_DIR)
    ? fs.readdirSync(SCREENS_DIR).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== '_sample.js')
    : [];
  for (const f of screenFiles) {
    for (const d of parseTypedefs(fs.readFileSync(path.join(SCREENS_DIR, f), 'utf8'), `screens/${f}`)) defs.set(d.name, d);
  }
  const iface = d => {
    if (d.alias) return `${d.doc ? `/** ${d.doc.replace(/\*\//g, '* /')} (${d.file}) */\n` : ''}export type ${d.name} = ${d.alias};`;
    const body = d.props.map(p => {
      const doc = [p.doc, p.def ? `Default ${p.def}.` : ''].filter(Boolean).join(' ');
      return `${doc ? `  /** ${doc.replace(/\*\//g, '* /')} */\n` : ''}  ${p.name}${p.optional ? '?' : ''}: ${p.type};`;
    }).join('\n');
    return `${d.doc ? `/** ${d.doc} (${d.file}) */\n` : `/** ${d.file} */\n`}export interface ${d.name} {\n${body}\n}`;
  };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  // Screens: <Name>Screen(data: <Name>ScreenData, options?: ScreenOptions); StopsScreen reuses TrainScreenData.
  const dataOf = fn => (defs.has(`${fn}Data`) ? `${fn}Data` : { StopsScreen: 'TrainScreenData' }[fn] || 'unknown');
  const isScreen = name => /^[A-Z]\w*Screen$/.test(name);
  const screenSigs = Object.keys(api?.screens || {}).map(name => (name === 'bindScreen'
    ? "  bindScreen(root: Element, opts?: { data?: unknown; onLang?: (lang: 'en' | 'ur') => void; onSnap?: (snap: 'down' | 'half' | 'full') => void; onSearch?: (value: string) => void; onClear?: () => void; onSegment?: (value: string, group: Element) => void; onPickFrom?: () => void; onPickTo?: () => void; onSwap?: () => void; onFollow?: (followed: boolean, button: HTMLElement) => void; onShare?: (button: HTMLElement) => void; onChangeStop?: () => void; onFollowing?: (on: boolean) => void; onMap?: (action: 'zoomIn' | 'zoomOut' | 'layers' | 'locate' | 'wholeRoute', button: HTMLElement) => void }): () => void;"
    : isScreen(name)
      ? `  ${name}(data: ${dataOf(name)}, options?: ScreenOptions): string;`
      : `  ${name}(...args: any[]): any;`));
  const sampleSigs = [...new Map(SCREEN_PAGES.map(p => [p.sample, `  ${p.sample}: ${dataOf(p.fn)};`])).values()];
  const screensTypes = api?.screens ? `

/** window.Patri.screens: page templates built from the components (public/js/screens/). */
export interface PatriScreens {
${screenSigs.join('\n')}
}

/** window.Patri.samples: frozen real sample data, one per screen (public/js/screens/_sample.js). */
export interface PatriSamples {
${sampleSigs.join('\n')}
}` : '';
  const sigs = Object.keys(api || {}).map(name => {
    if (name === 'screens') return '  screens: PatriScreens;';
    if (name === 'samples') return '  samples: PatriSamples;';
    if (SPECIAL[name]) return `  ${name}${SPECIAL[name]};`;
    if (name.startsWith('bind')) {
      const h = `${name.slice(4)}Handlers`;
      return defs.has(h) ? `  ${name}(root: Element, handlers?: ${h}): () => void;` : `  ${name}(root: Element, ...args: any[]): () => void;`;
    }
    const p = `${cap(name)}Props`;
    return defs.has(p) ? `  ${name}(props: ${p}): string;` : `  ${name}(...args: any[]): any;`;
  });
  const out = path.join(OUT_DIR, 'index.d.ts');
  fs.writeFileSync(out, `// GENERATED FILE: do not edit by hand. Built by scripts/build-design-system.js from the
// @typedef JSDoc in public/js/components/*.js and public/js/screens/*.js. Run \`npm run ds\`.
//
// Patri components, Sabz look. Load tokens.css, bundle.css and bundle.js, then call
// window.Patri.<Name>(props) for an HTML string and window.Patri.bind<Name>(root, handlers)
// for behaviour; each bind returns an unbind function. Text props arrive already localised.

${[...defs.values()].map(iface).join('\n\n')}${screensTypes}

export interface PatriApi {
${sigs.join('\n')}
}

declare global {
  interface Window { Patri: PatriApi }
}
`);
  console.log(`ds: ${rel(out)}: ${defs.size} interfaces`);
  return defs;
}

// ---------------------------------------------------------------------------------------------
(async () => {
  const registry = readRegistry();
  buildTokens();
  const api = await buildBundle(registry);
  if (!api) return;
  copyStyles();
  const defs = buildTypes(api);
  // Checks that keep the code, the docs and the library page in step.
  const problems = [];
  for (const c of registry) {
    if (!fs.existsSync(path.join(COMPONENTS_DIR, `${c.name}.js`))) problems.push(`no module public/js/components/${c.name}.js`);
    if (!defs.has(`${c.name}Props`)) problems.push(`no @typedef ${c.name}Props`);
    const dir = path.join(OUT_DIR, c.name);
    for (const f of ['README.md', 'preview.html']) if (!fs.existsSync(path.join(dir, f))) problems.push(`no design-system/components/${c.name}/${f}`);
    const preview = path.join(dir, 'preview.html');
    if (fs.existsSync(preview)) {
      const first = fs.readFileSync(preview, 'utf8').split('\n')[0];
      if (!new RegExp(`^<!-- @dsCard group="${c.group}" height=\\d+ -->$`).test(first)) problems.push(`${c.name}/preview.html line 1 should be <!-- @dsCard group="${c.group}" height=<N> -->`);
    }
  }
  // The screen showcase pages.
  if (api.screens) {
    for (const page of SCREEN_PAGES) {
      const dir = path.join(OUT_DIR, page.folder);
      for (const f of ['README.md', 'preview.html']) if (!fs.existsSync(path.join(dir, f))) problems.push(`no design-system/components/${page.folder}/${f}`);
      const preview = path.join(dir, 'preview.html');
      if (!fs.existsSync(preview)) continue;
      const html = fs.readFileSync(preview, 'utf8');
      const width = page.layout === 'web' ? 1440 : 390;
      if (!new RegExp(`^<!-- @dsCard group="Screens" height=\\d+ width=${width} page -->$`).test(html.split('\n')[0])) {
        problems.push(`${page.folder}/preview.html line 1 should be <!-- @dsCard group="Screens" height=<N> width=${width} page -->`);
      }
      if (!html.includes(`screens.${page.fn}(`) || !html.includes(`samples.${page.sample}`)) problems.push(`${page.folder}/preview.html should render screens.${page.fn}(samples.${page.sample}, …)`);
      if (!html.includes(`'${page.layout}'`)) problems.push(`${page.folder}/preview.html should use layout '${page.layout}'`);
      if (!html.includes('bindScreen(')) problems.push(`${page.folder}/preview.html should call screens.bindScreen()`);
      if (/p-appbar|AppBar|HomeScreen|layout: 'web'/.test(html) && !html.includes(LOGO_BLOB)) problems.push(`${page.folder}/preview.html should point the logo at ${LOGO_BLOB}`);
      if (/\bfetch\(|XMLHttpRequest|WebSocket|<script[^>]+src=/i.test(html)) problems.push(`${page.folder}/preview.html must not load scripts or data`);
    }
  }
  if (problems.length) {
    console.warn(`ds: ${problems.length} warning(s):\n  ${problems.join('\n  ')}`);
  }
  console.log(`ds: done, ${registry.length} components${api.screens ? `, ${SCREEN_PAGES.length} screen pages` : ''}`);
})();
