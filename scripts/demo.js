/* Adds "Edit code" (an embedded LiveCodes playground) and "Open in LiveCodes"
 * under every <figure class="demo">. The code is read from the page's own HTML,
 * so the post stays the single source of truth.
 */

const SDK_URL = 'https://cdn.jsdelivr.net/npm/livecodes@0.14.1';
const BASE_CSS = 'body { font-family: Georgia, serif; color: #333; padding: 1rem; }';
const PLAYGROUND_HEIGHT = '480';

let sdk;
let page;
const getSdk = () => (sdk ??= import(SDK_URL));
const getPage = () =>
  (page ??= fetch(location.href).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  }));

const dedent = (s) => {
  const lines = s.replace(/^\n+|\s+$/g, '').split('\n');
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(pad)).join('\n');
};
const grab = (re, s) => [...s.matchAll(re)].map((m) => m[1]).join('\n');

// Split the n-th demo in the page source into HTML, CSS and JS.
function sources(text, index) {
  const open = '<figure class="demo"';
  const close = '</figure>';
  const figures = [];
  for (let i = 0; (i = text.indexOf(open, i)) !== -1; ) {
    const end = text.indexOf(close, i) + close.length;
    figures.push(text.slice(i, end));
    i = end;
  }
  const raw = figures[index] ?? '';
  const shared = (text.match(/<style data-demo-shared[^>]*>([\s\S]*?)<\/style>/) || [])[1] || '';
  const ownCss = grab(/<style[^>]*>([\s\S]*?)<\/style>/g, raw);
  return {
    html: dedent(raw.replace(/\n?\s*<(style|script)[^>]*>[\s\S]*?<\/\1>/g, '')),
    // A prelude-less @scope only works inside the figure; in a separate
    // stylesheet it needs an explicit root.
    css:
      `${BASE_CSS}\n\n${dedent(shared)}\n\n/* This demo */\n` +
      dedent(ownCss).replace(/@scope\s*\{/g, '@scope (.demo) {'),
    js: dedent(grab(/<script[^>]*>([\s\S]*?)<\/script>/g, raw)),
  };
}

const configFor = (src, title) => ({
  title,
  markup: { language: 'html', content: src.html },
  style: { language: 'css', content: src.css },
  script: { language: 'javascript', content: src.js },
  activeEditor: 'markup',
  theme: 'light',
});

function enhance(figure, index) {
  const title = figure.querySelector('figcaption')?.textContent.trim() || 'Customizable select demo';
  const id = `demo-playground-${index + 1}`;

  const tools = document.createElement('div');
  tools.className = 'demo-tools';
  tools.innerHTML = `
    <div class="demo-tools-bar">
      <button type="button" class="demo-edit" aria-expanded="false" aria-controls="${id}" hidden>Edit code</button>
      <a class="demo-open" target="_blank" rel="noopener" hidden>Open in LiveCodes</a>
    </div>
    <div class="demo-playground" id="${id}" data-height="${PLAYGROUND_HEIGHT}" hidden></div>`;
  figure.append(tools);

  const edit = tools.querySelector('.demo-edit');
  const openLink = tools.querySelector('.demo-open');
  const stage = tools.querySelector('.demo-playground');
  let config;
  let playground;

  // Both buttons appear only once the source and the SDK have loaded.
  const ready = Promise.all([getPage(), getSdk()]).then(([text, { getPlaygroundUrl }]) => {
    config = configFor(sources(text, index), title);
    openLink.href = getPlaygroundUrl({ config });
    edit.hidden = false;
    openLink.hidden = false;
  });
  ready.catch(() => {}); // no source, no tools

  edit.addEventListener('click', async () => {
    const expanded = edit.getAttribute('aria-expanded') === 'true';
    edit.setAttribute('aria-expanded', String(!expanded));
    edit.textContent = expanded ? 'Edit code' : 'Hide code';
    stage.hidden = expanded;
    if (expanded || playground) return;
    try {
      await ready;
      const { createPlayground } = await getSdk();
      playground = await createPlayground(stage, { config, loading: 'eager' });
    } catch {
      stage.textContent = 'Couldn’t load the playground.';
    }
  });
}

const start = () => document.querySelectorAll('figure.demo').forEach(enhance);
'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 200);
