/* The project page. Reads site/project.json and draws it with the dukecodes design system
   (site/ds/bundle.js). No build step: plain React.createElement.

   The page runs under a strict Content-Security-Policy with Trusted Types, so nothing here turns
   a string into HTML or code, and every style lives in app.css. scripts/check_site.py enforces
   that on every commit. Where the design system needs help, the fix is marked "DS fix" and
   listed in docs/design-system-fixes.md. */
(function () {
  'use strict';

  const mount = document.getElementById('root');

  // Shown when React or the design system did not load, so the page never stays blank.
  function bootFailure(message) {
    mount.textContent = '';
    const box = document.createElement('div');
    box.className = 'pg-boot';
    const title = document.createElement('p');
    title.className = 'pg-boot-title';
    title.textContent = 'The page could not start.';
    const body = document.createElement('p');
    body.textContent = message;
    box.append(title, body);
    mount.append(box);
  }

  if (!window.React || !window.ReactDOM || !window.Dukecodes) {
    bootFailure('Its scripts did not load. Everything on this page is also in the repository: start with README.md.');
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const DS = window.Dukecodes;
  const h = React.createElement;
  const { Fragment, useState, useEffect, useRef, useMemo } = React;

  // ---------------------------------------------------------------- fixed vocabulary

  const VIEWS = ['home', 'runbook', 'gates', 'reference'];
  const NAV = [
    { to: '/', view: 'home', label: 'Mission', sub: 'Home' },
    { to: '/runbook', view: 'runbook', label: 'Runbook', sub: 'Every step' },
    { to: '/gates', view: 'gates', label: 'Gates', sub: 'Every check' },
    { to: '/reference', view: 'reference', label: 'Reference', sub: 'Labels, glossary, versions' },
  ];
  const VIEW_TITLES = { runbook: 'Runbook', gates: 'Gates', reference: 'Reference', missing: 'Not found' };
  const REF_SECTIONS = [
    ['labels', 'Labels'],
    ['flashcards', 'Flashcards'],
    ['glossary', 'Glossary'],
    ['versions', 'Versions'],
    ['layout', 'Layout'],
  ];
  const RISK_TONE = { safe: 'green', caution: 'amber', destructive: 'red', danger: 'red' };
  const LABEL_TONE = { FACT: 'teal', INFERENCE: 'neutral', COMMUNITY: 'neutral', PROPOSAL: 'violet', ASSUMPTION: 'violet' };
  const PIN_NAMES = { sha: 'commit SHA', version: 'exact version', sha256: 'file hash' };

  // The same meanings as docs/STYLE.md. Change both together.
  const LEGEND = [
    {
      title: 'Truth labels',
      rows: [
        { chip: 'FACT', text: "Checked against official docs or the tool's real output." },
        { chip: 'INFERENCE', text: 'Follows from facts, but nobody ran it to prove it.' },
        { chip: 'COMMUNITY', text: 'Widely reported to work, but not in official docs.' },
        { chip: 'PROPOSAL', text: 'A suggestion. Decide whether it fits your project.' },
        { chip: 'ASSUMPTION', text: 'Taken as true without checking. Confirm it before you rely on it.' },
      ],
    },
    {
      title: 'Confidence',
      rows: [
        { chip: 'HIGH', text: 'Run here, or several good sources agree.' },
        { chip: 'MED', text: 'One good source, or it may have changed since.' },
        { chip: 'LOW', text: 'Thin evidence. Treat it as a lead, not an answer.' },
      ],
    },
    {
      title: 'Risk',
      rows: [
        { chip: 'safe', text: 'Only reads, or is easy to undo.' },
        { chip: 'caution', text: 'Changes something. The Undo part says how to reverse it.' },
        { chip: 'destructive', text: 'Deletes or overwrites. Undo may not bring it all back.' },
        { chip: 'danger', text: 'Can lock you out or lose data for good. Read every word first.' },
      ],
    },
  ];

  // GitHub Pages project sites share one origin, so progress is kept per page path.
  const TICKS_KEY = 'dc-ticks:' + location.pathname;
  const THEME_KEY = 'dc-theme';

  // ---------------------------------------------------------------- helpers

  const cx = (...names) => names.filter(Boolean).join(' ');
  const pad2 = (n) => String(n).padStart(2, '0');
  const plain = (s) => String(s == null ? '' : s).split('`').join('');
  const isHttps = (url) => typeof url === 'string' && /^https:\/\/[^\s/]+/.test(url);

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  // Storage can be blocked (private windows, strict settings). The page still works; it just forgets.
  const store = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        /* not saved */
      }
    },
  };

  function allSteps(data) {
    const out = [];
    data.stages.forEach((stage) => stage.steps.forEach((step) => out.push({ step, stage })));
    return out;
  }

  function loadTicks(ids) {
    const out = {};
    try {
      const saved = JSON.parse(store.get(TICKS_KEY) || '{}');
      ids.forEach((id) => {
        if (saved && saved[id] === true) out[id] = true;
      });
    } catch (e) {
      /* unreadable: start fresh */
    }
    return out;
  }

  function stageStats(stage, ticks) {
    const done = stage.steps.filter((s) => ticks[s.id]).length;
    const total = stage.steps.length;
    return { done, total, pct: Math.round((done / total) * 100), complete: done === total };
  }

  // The stage to work on next: the first unfinished required stage, then optional ones.
  function currentStage(data, ticks) {
    const open = (stage) => stage.steps.some((s) => !ticks[s.id]);
    let i = data.stages.findIndex((stage) => !stage.optional && open(stage));
    if (i < 0) i = data.stages.findIndex(open);
    return i;
  }

  function nextStep(data, ticks) {
    const i = currentStage(data, ticks);
    if (i < 0) return null;
    const stage = data.stages[i];
    return { stage, step: stage.steps.find((s) => !ticks[s.id]) };
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  // ---------------------------------------------------------------- glossary and rich text

  // Glossary words grouped by first letter, longest first. Words with a capital letter (CI, PR, SHA)
  // match only exactly, so ordinary words that share the letters never link. Matching is plain
  // string comparison, never a pattern built from project.json, so no word can make it slow.
  function buildGlossary(list) {
    const byFirst = new Map();
    list.forEach((g) =>
      (g.match || []).forEach((w) => {
        if (typeof w !== 'string' || !w) return;
        const key = w[0].toLowerCase();
        if (!byFirst.has(key)) byFirst.set(key, []);
        byFirst.get(key).push({ w, low: w.toLowerCase(), exact: /[A-Z]/.test(w), g });
      }),
    );
    if (!byFirst.size) return null;
    byFirst.forEach((words) => words.sort((a, b) => b.w.length - a.w.length));
    return byFirst;
  }

  // Letters, digits, _ and - are part of a word: "ci" in "circle" or "hook" in "pre-hook" never link.
  const isWordChar = (ch) => ch !== undefined && /[A-Za-z0-9_-]/.test(ch);

  // The longest glossary word that starts at text[i] and ends at a word edge, or null.
  function termAt(text, i, gloss) {
    const words = gloss.get(text[i].toLowerCase());
    if (!words) return null;
    for (const t of words) {
      const end = i + t.w.length;
      if (end > text.length || isWordChar(text[end])) continue;
      const piece = text.slice(i, end);
      if (t.exact ? piece === t.w : piece.toLowerCase() === t.low) return t;
    }
    return null;
  }

  // A scope links each glossary word once: the first time it appears in that section or step.
  const scope = (gloss) => (gloss ? { gloss, seen: new Set() } : null);

  function linkTerms(text, sc, out, keyBase) {
    let last = 0;
    let n = 0;
    for (let i = 0; i < text.length; i++) {
      if (isWordChar(text[i - 1])) continue; // words start only at a word edge
      const t = termAt(text, i, sc.gloss);
      if (!t) continue;
      const end = i + t.w.length;
      if (!sc.seen.has(t.g.term)) {
        sc.seen.add(t.g.term);
        if (i > last) out.push(text.slice(last, i));
        out.push(h(DS.GlossaryTerm, { key: keyBase + '-' + n++, term: t.g.term, def: t.g.def }, text.slice(i, end)));
        last = end;
      }
      i = end - 1; // skip the rest of the word, linked or not
    }
    if (last < text.length) out.push(text.slice(last));
  }

  // Text from project.json: `backticks` become code, glossary words get a hover definition.
  function rich(text, sc) {
    if (text == null || text === '') return null;
    const out = [];
    String(text)
      .split('`')
      .forEach((part, i) => {
        if (!part) return;
        if (i % 2) out.push(h('code', { key: 'c' + i, className: 'pg-code' }, part));
        else if (sc) linkTerms(part, sc, out, 't' + i);
        else out.push(part);
      });
    return out;
  }

  // ---------------------------------------------------------------- routing

  // Routes live in the hash (#/runbook/get-01) because GitHub Pages serves static files only.
  const ROUTE_RE = /^#\/(?:([a-z]+)(?:\/([a-z0-9-]+))?)?$/;

  function parseHash(hash) {
    if (!hash || hash === '#') return { view: 'home', id: null };
    const m = ROUTE_RE.exec(hash);
    if (!m) return null; // not a route: leave the page as it is
    const view = m[1] || 'home';
    return VIEWS.includes(view) ? { view, id: m[2] || null } : { view: 'missing', id: null };
  }

  function go(to) {
    const hash = '#' + to;
    if (location.hash === hash) window.dispatchEvent(new Event('dc:renav'));
    else location.hash = hash;
  }

  function useRoute() {
    const [route, setRoute] = useState(() => ({ ...(parseHash(location.hash) || { view: 'home', id: null }), n: 0 }));
    useEffect(() => {
      const onHash = () => {
        const r = parseHash(location.hash);
        if (r) setRoute((prev) => ({ ...r, n: prev.n + 1 }));
      };
      const onRenav = () => setRoute((prev) => ({ ...prev, n: prev.n + 1 }));
      window.addEventListener('hashchange', onHash);
      window.addEventListener('dc:renav', onRenav);
      return () => {
        window.removeEventListener('hashchange', onHash);
        window.removeEventListener('dc:renav', onRenav);
      };
    }, []);
    return route;
  }

  function findTarget(route) {
    const byId = (x) => document.getElementById(x);
    const id = route.id;
    if (route.view === 'home') {
      const box = byId('sec-' + id);
      return box && { box, focus: box.querySelector('h2') };
    }
    if (route.view === 'gates') {
      const box = byId('gate-' + id);
      return box && { box, focus: box };
    }
    if (route.view === 'reference') {
      const box = byId('ref-' + id);
      return box && { box, focus: box.querySelector('h2') };
    }
    if (route.view === 'runbook') {
      const step = byId('step-' + id);
      if (step) {
        // The card's caret button opens it and says whether it is open.
        const toggle = step.querySelector('.dk-step .car');
        if (toggle && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
        return { box: step, focus: toggle };
      }
      const stage = byId('stage-' + id);
      return stage && { box: stage, focus: stage.querySelector('h2') };
    }
    return null;
  }

  function focusQuietly(el) {
    if (el) el.focus({ preventScroll: true });
  }

  // After each navigation: scroll to the target and move focus there, so keyboard and screen
  // reader users land where the link said. A plain first visit starts at the top, untouched.
  function useRouteFocus(route, announce) {
    const first = useRef(true);
    useEffect(() => {
      const isFirst = first.current;
      first.current = false;
      if (isFirst && !route.id) return;
      if (!route.id) {
        window.scrollTo(0, 0);
        focusQuietly(document.getElementById('view-title'));
        return;
      }
      const found = findTarget(route);
      if (!found) {
        announce('Nothing called ' + route.id + ' on this page.');
        focusQuietly(document.getElementById('view-title'));
        return;
      }
      found.box.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
      focusQuietly(found.focus);
    }, [route.n]); // eslint-disable-line react-hooks/exhaustive-deps
  }

  // ---------------------------------------------------------------- theme

  function useTheme() {
    const [theme, setTheme] = useState(() => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'));
    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    useEffect(() => {
      // Follow the system setting until the reader picks a theme on this page.
      let mq = null;
      try {
        mq = window.matchMedia('(prefers-color-scheme: dark)');
      } catch (e) {
        return undefined;
      }
      if (!mq || !mq.addEventListener) return undefined;
      const onChange = (e) => {
        const saved = store.get(THEME_KEY);
        if (saved !== 'light' && saved !== 'dark') setTheme(e.matches ? 'dark' : 'light');
      };
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }, []);
    const toggle = () => {
      const next = theme === 'dark' ? 'light' : 'dark';
      store.set(THEME_KEY, next);
      setTheme(next);
    };
    return [theme, toggle];
  }

  // ---------------------------------------------------------------- small parts

  function Link({ to, href, className, current, children }) {
    if (href != null) {
      if (!isHttps(href)) return h('span', { className }, children);
      return h(
        'a',
        { href, className, target: '_blank', rel: 'noopener noreferrer' },
        children,
        h('span', { className: 'pg-ext', 'aria-hidden': true }, '↗'),
        h('span', { className: 'pg-sr' }, ' (opens in a new tab)'),
      );
    }
    const hash = '#' + to;
    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (location.hash === hash) {
        e.preventDefault();
        window.dispatchEvent(new Event('dc:renav'));
      }
    };
    return h('a', { href: hash, className, 'aria-current': current || null, onClick }, children);
  }

  function Arrow() {
    return h('span', { 'aria-hidden': true }, ' →');
  }

  function Cta({ cta }) {
    const variant = cta.variant && cta.variant !== 'default' ? cta.variant : null;
    return h(Link, { to: cta.to, className: cx('dk-btn', variant, 'pg-cta') }, cta.label);
  }

  function Svg({ size, children, className }) {
    return h(
      'svg',
      {
        className,
        width: size || 16,
        height: size || 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2.2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: 'false',
      },
      children,
    );
  }

  const MoonIcon = () => h(Svg, null, h('path', { d: 'M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7z' }));
  const SunIcon = () =>
    h(
      Svg,
      null,
      h('circle', { cx: 12, cy: 12, r: 4 }),
      h('path', { d: 'M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4' }),
    );

  // Three rack units in a frame: amber, teal, grey.
  function BrandMark() {
    return h(
      'svg',
      { className: 'pg-mark', width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: 'false' },
      h('rect', { className: 'f', x: 1.5, y: 1.5, width: 21, height: 21, rx: 4 }),
      h('rect', { className: 'u1', x: 5, y: 5.2, width: 14, height: 3.4, rx: 1.2 }),
      h('rect', { className: 'u2', x: 5, y: 10.3, width: 14, height: 3.4, rx: 1.2 }),
      h('rect', { className: 'u3', x: 5, y: 15.4, width: 14, height: 3.4, rx: 1.2 }),
    );
  }

  function SecHead({ eyebrow, title, sub, sc }) {
    return h(
      'div',
      { className: 'pg-sechead' },
      eyebrow ? h('p', { className: 'dk-eyebrow pg-eyebrow' }, eyebrow) : null,
      h('h2', { className: 'pg-h2', tabIndex: -1 }, title),
      sub ? h('p', { className: 'pg-sub' }, rich(sub, sc)) : null,
    );
  }

  function ViewHead({ eyebrow, title, sub, sc, children }) {
    return h(
      'header',
      { className: 'pg-viewhead' },
      h('p', { className: 'dk-eyebrow pg-eyebrow' }, eyebrow),
      h('h1', { className: 'pg-h1 pg-h1-view', id: 'view-title', tabIndex: -1 }, title),
      sub ? h('p', { className: 'pg-lede' }, rich(sub, sc)) : null,
      children,
    );
  }

  // ---------------------------------------------------------------- header and search

  function paletteItems(data) {
    const items = [];
    NAV.forEach((n) => items.push({ id: 'page:' + n.view, kind: 'page', title: n.label, sub: n.sub, to: n.to }));
    [
      ['console', data.console.title],
      ['pipeline', data.pipeline.title],
      ['break', data.simulator.title],
      ['why', data.why.title],
      ['path', data.path.title],
    ].forEach(([id, title]) => items.push({ id: 'sec:' + id, kind: 'section', title: plain(title), sub: 'Mission', to: '/home/' + id }));
    data.stages.forEach((stage, i) => {
      items.push({ id: 'stage:' + stage.id, kind: 'stage', title: plain(stage.title), sub: 'Stage ' + pad2(i + 1), to: '/runbook/' + stage.id });
      stage.steps.forEach((s) =>
        items.push({ id: 'step:' + s.id, kind: 'step', title: plain(s.title), sub: s.id + ' · ' + plain(stage.title), to: '/runbook/' + s.id }),
      );
    });
    data.gates.rows.forEach((r) => items.push({ id: 'gate:' + r.id, kind: 'gate', title: plain(r.gate), sub: plain(r.tool), to: '/gates/' + r.id }));
    REF_SECTIONS.forEach(([id, label]) => items.push({ id: 'ref:' + id, kind: 'section', title: label, sub: 'Reference', to: '/reference/' + id }));
    (data.glossary || []).forEach((g) => items.push({ id: 'term:' + g.term, kind: 'term', title: g.term, sub: 'Glossary', to: '/reference/glossary', term: g.term }));
    return items;
  }

  // True while the media query matches; follows the window as it resizes.
  function useMedia(query) {
    const read = () => {
      try {
        return window.matchMedia(query).matches;
      } catch (e) {
        return false;
      }
    };
    const [on, setOn] = useState(read);
    useEffect(() => {
      let mq = null;
      try {
        mq = window.matchMedia(query);
      } catch (e) {
        return undefined;
      }
      const onChange = () => setOn(mq.matches);
      onChange();
      if (!mq.addEventListener) return undefined;
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return on;
  }

  // The header's search: this page's no-match hint, and the icon only where the header is narrow.
  function Palette({ items, onPick, hint }) {
    const narrow = useMedia('(max-width: 719px)');
    return h(
      'div',
      { className: 'pg-palette' },
      h(DS.CommandPalette, { items, placeholder: 'Search steps, gates, terms', onSelect: onPick, emptyHint: hint, compact: narrow }),
    );
  }

  function Header({ data, route, theme, toggleTheme, items, onPick, hint }) {
    const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    const skip = (e) => {
      e.preventDefault();
      focusQuietly(document.getElementById('main'));
      window.scrollTo(0, 0);
    };
    return h(
      'header',
      { className: 'pg-header' },
      h('a', { className: 'pg-skip', href: '#main', onClick: skip }, 'Skip to content'),
      h(
        'div',
        { className: 'pg-header-in' },
        h(
          Link,
          { to: '/', className: 'pg-brand' },
          h(BrandMark),
          h('span', null, data.brand.left, h('span', { className: 'pg-brand-sep', 'aria-hidden': true }, ' // '), h('span', { className: 'pg-sr' }, ' '), data.brand.right),
        ),
        h(
          'nav',
          { className: 'pg-nav', 'aria-label': 'Main' },
          h(
            'ul',
            null,
            NAV.map((n) => h('li', { key: n.view }, h(Link, { to: n.to, current: route.view === n.view ? 'page' : null }, n.label))),
          ),
        ),
        h(
          'div',
          { className: 'pg-tools' },
          h(Palette, { items, onPick, hint }),
          h(DS.Button, { className: 'pg-theme', onClick: toggleTheme, ariaLabel: themeLabel, title: themeLabel }, theme === 'dark' ? h(SunIcon) : h(MoonIcon)),
        ),
      ),
    );
  }

  function Footer({ data }) {
    return h(
      'footer',
      { className: 'pg-footer' },
      h(
        'div',
        { className: 'pg-wrap pg-footer-in' },
        h('p', { className: 'pg-footer-brand' }, h(BrandMark), h('span', null, data.brand.left + ' // ' + data.brand.right)),
        h('p', null, rich(data.footer, null)),
        data.repo ? h('p', null, h(Link, { href: data.repo }, 'Source on GitHub')) : null,
      ),
    );
  }

  // ---------------------------------------------------------------- home: console

  function ConsolePanel({ console: c }) {
    return h('div', { className: 'pg-console' }, h(DS.LiveConsole, { scenarios: c.scenarios, passLine: c.passLine }));
  }

  // ---------------------------------------------------------------- home: sections

  function Hero({ data, gloss }) {
    const hero = data.hero;
    const sc = scope(gloss);
    return h(
      'section',
      { className: 'pg-hero', 'aria-labelledby': 'view-title' },
      h(
        'div',
        { className: 'pg-hero-copy' },
        h('p', { className: 'dk-eyebrow pg-eyebrow' }, hero.eyebrow),
        h(
          'h1',
          { className: 'pg-h1', id: 'view-title', tabIndex: -1 },
          hero.headline.before,
          ' ',
          h('span', { className: 'pg-accent' }, hero.headline.accent),
          hero.headline.after ? ' ' + hero.headline.after : null,
        ),
        h('p', { className: 'pg-lede' }, rich(hero.lede, sc)),
        h('div', { className: 'pg-ctas' }, hero.ctas.map((c) => h(Cta, { key: c.to + c.label, cta: c }))),
        h('div', { className: 'pg-stats' }, hero.stats.map((s) => h(DS.StatTile, { key: s.label, value: s.value, label: s.label }))),
      ),
      h(
        'div',
        { className: 'pg-hero-side', id: 'sec-console' },
        h('h2', { className: 'pg-h3', tabIndex: -1 }, data.console.title),
        h(ConsolePanel, { console: data.console }),
        h('p', { className: 'pg-note' }, rich(data.console.note, null)),
      ),
    );
  }

  function NextUp({ data, ticks }) {
    const steps = allSteps(data);
    const done = steps.filter((x) => ticks[x.step.id]).length;
    const pct = Math.round((done / steps.length) * 100);
    const next = nextStep(data, ticks);
    return h(
      DS.Panel,
      { className: 'pg-next' },
      h(DS.ProgressRing, { value: pct, label: done + ' of ' + steps.length + ' steps', sub: next ? 'Saved in this browser only' : 'Every step is done' }),
      h(
        'div',
        { className: 'pg-next-step' },
        h(
          'div',
          { className: 'pg-next-text' },
          h('p', { className: 'dk-eyebrow pg-eyebrow' }, next ? 'Next up' : 'All done'),
          next
            ? h('p', { className: 'pg-next-label' }, h('span', { className: 'pg-next-id' }, next.step.id), plain(next.step.title))
            : h('p', { className: 'pg-next-label' }, 'Now check what stuck.'),
        ),
        next
          ? h(Link, { to: '/runbook/' + next.step.id, className: 'dk-btn primary' }, (done ? 'Continue with ' : 'Start with ') + next.step.id, h(Arrow))
          : h(Link, { to: '/reference/flashcards', className: 'dk-btn primary' }, 'Test yourself', h(Arrow)),
      ),
    );
  }

  function PipelineSection({ data, ticks, gloss }) {
    const cur = currentStage(data, ticks);
    return h(
      'section',
      { className: 'pg-sec', id: 'sec-pipeline' },
      h(SecHead, { eyebrow: 'Runbook', title: data.pipeline.title, sub: data.pipeline.sub, sc: scope(gloss) }),
      h(
        'div',
        { className: 'pg-pipeline' },
        h(
          'ol',
          { className: 'dk-stages pg-stages' },
          data.stages.map((stage, i) => {
            const s = stageStats(stage, ticks);
            const state = s.complete ? 'done' : i === cur ? 'active' : 'idle';
            return h(
              'li',
              { key: stage.id },
              h(DS.StageCard, {
                n: i + 1,
                title: plain(stage.title),
                progress: s.pct,
                state,
                status: stage.optional && !s.complete ? 'optional' : null,
                onClick: () => go('/runbook/' + stage.id),
              }),
            );
          }),
        ),
        h(NextUp, { data, ticks }),
      ),
    );
  }

  function BreakSection({ data, gloss }) {
    const sim = data.simulator;
    const sc = scope(gloss);
    return h(
      'section',
      { className: 'pg-sec', id: 'sec-break' },
      h(SecHead, { eyebrow: 'Attack lab', title: sim.title, sub: sim.sub, sc }),
      h(DS.Panel, { className: 'pg-sim' }, h(DS.GateSimulator, { gates: sim.gates, attacks: sim.attacks })),
      sim.note ? h('p', { className: 'pg-note' }, rich(sim.note, sc)) : null,
    );
  }

  function WhySection({ data, gloss }) {
    const why = data.why;
    const sc = scope(gloss);
    return h(
      'section',
      { className: 'pg-sec pg-why', id: 'sec-why' },
      h(SecHead, { eyebrow: 'Design', title: why.title, sub: why.sub, sc }),
      h(
        'div',
        { className: 'dk-bento' },
        why.cards.map((c, i) =>
          h(
            DS.BentoCard,
            { key: i, span: c.span, tone: c.tone, eyebrow: c.eyebrow, stat: c.stat, title: c.title },
            rich(c.body, sc),
            c.link ? h(Fragment, null, ' ', h(Link, { to: c.link.to, className: 'pg-more' }, c.link.label, h(Arrow))) : null,
          ),
        ),
      ),
    );
  }

  function PathSection({ data }) {
    const path = data.path;
    return h(
      'section',
      { className: 'pg-sec', id: 'sec-path' },
      h(SecHead, { eyebrow: 'Path', title: path.title, sub: path.sub, sc: null }),
      h(
        'ol',
        { className: 'pg-path' },
        path.steps.map((s, i) =>
          h(
            'li',
            { key: i, className: 'pg-path-step' },
            h('span', { className: 'pg-path-n', 'aria-hidden': true }, pad2(i + 1)),
            h('p', { className: 'pg-path-when' }, s.when),
            h('h3', { className: 'pg-path-title' }, s.to ? h(Link, { to: s.to, className: 'pg-path-link' }, s.title) : s.title),
            h('p', { className: 'pg-path-body' }, rich(s.body, null)),
          ),
        ),
      ),
    );
  }

  function FinalSection({ data, gloss }) {
    const f = data.final;
    return h(
      'section',
      { className: 'pg-sec' },
      h(
        DS.Panel,
        { className: 'pg-final' },
        h('p', { className: 'dk-eyebrow pg-eyebrow' }, f.eyebrow),
        h('h2', { className: 'pg-h2 pg-final-title' }, f.title),
        h('p', { className: 'pg-sub' }, rich(f.body, scope(gloss))),
        h('div', { className: 'pg-ctas pg-ctas-center' }, f.ctas.map((c) => h(Cta, { key: c.to + c.label, cta: c }))),
      ),
    );
  }

  function HomeView(props) {
    return h(
      'div',
      { className: 'pg-wrap' },
      h(Hero, props),
      h(PipelineSection, props),
      h(BreakSection, props),
      h(WhySection, props),
      h(PathSection, props),
      h(FinalSection, props),
    );
  }

  // ---------------------------------------------------------------- runbook

  function stepChips(step) {
    return [
      h(DS.Chip, { key: 'risk', tone: RISK_TONE[step.risk] || 'neutral', dot: step.risk === 'danger' }, h('span', { className: 'pg-sr' }, 'Risk: '), step.risk),
      h(
        DS.Chip,
        { key: 'label', tone: LABEL_TONE[step.label] || 'neutral' },
        h('span', { className: 'pg-sr' }, 'Truth label: '),
        step.label,
        h('span', { 'aria-hidden': true }, ' · '),
        h('span', { className: 'pg-sr' }, ', confidence '),
        step.conf,
      ),
      h(DS.Chip, { key: 'on', tone: 'teal' }, h('span', { className: 'pg-sr' }, 'Runs on: '), step.on),
      h(DS.Chip, { key: 'time' }, h('span', { className: 'pg-sr' }, 'Time: '), step.time),
    ];
  }

  function Block({ title, children }) {
    return h('div', { className: 'pg-block' }, h('h3', { className: 'pg-block-title' }, title), children);
  }

  // Every step answers four things: why, what to type, how to check it worked, how to undo it.
  function StepBody({ step, gloss }) {
    const sc = scope(gloss);
    const callouts = step.callouts || [];
    const sources = step.sources || [];
    return h(
      'div',
      { className: 'pg-stepbody' },
      h(Block, { title: 'Why' }, h('p', null, rich(step.why, sc))),
      h(
        Block,
        { title: 'Do' },
        h(
          'div',
          { className: 'pg-do' },
          step.do.map((d, i) => (d.code != null ? h(DS.CodeBlock, { key: i, code: d.code, where: d.where }) : h('p', { key: i }, rich(d.text, sc)))),
        ),
      ),
      callouts.length
        ? h('div', { className: 'pg-callouts' }, callouts.map((c, i) => h(DS.Callout, { key: i, kind: c.kind, label: c.label }, rich(c.text, sc))))
        : null,
      h(
        Block,
        { title: 'Check it worked' },
        h('p', null, rich(step.check.text, sc)),
        step.check.replay ? h(DS.TerminalReplay, { script: step.check.replay, prompt: step.check.prompt || '$', title: step.on }) : null,
      ),
      h(
        Block,
        { title: 'Undo' },
        h('p', null, rich(step.undo.text, sc)),
        step.undo.code ? h(DS.CodeBlock, { code: step.undo.code, where: step.undo.where }) : null,
      ),
      sources.length
        ? h(Block, { title: 'Sources' }, h('ul', { className: 'pg-sources' }, sources.map((s) => h('li', { key: s.url }, h(Link, { href: s.url }, s.title)))))
        : null,
    );
  }

  function Step({ step, done, onDone, gloss }) {
    return h(
      'div',
      { className: 'pg-stepwrap', id: 'step-' + step.id },
      h(DS.StepCard, { id: step.id, title: plain(step.title), defaultDone: done, onDone: (v) => onDone(step.id, v), chips: stepChips(step) }, h(StepBody, { step, gloss })),
    );
  }

  function StageBlock({ stage, n, ticks, gen, filter, shown, onDone, gloss }) {
    const s = stageStats(stage, ticks);
    const visible = stage.steps.filter(shown);
    return h(
      'section',
      { className: 'pg-stage', id: 'stage-' + stage.id, 'aria-labelledby': 'stage-h-' + stage.id },
      h(
        'div',
        { className: 'pg-stage-head' },
        h('p', { className: 'pg-stage-n' }, 'Stage ' + pad2(n) + (stage.optional ? ' · optional' : '')),
        h('h2', { className: 'pg-stage-title', id: 'stage-h-' + stage.id, tabIndex: -1 }, plain(stage.title)),
        h('p', { className: cx('pg-stage-count', s.complete && 'done') }, s.complete ? '✓ All ' + s.total + ' done' : s.done + ' of ' + s.total + ' done'),
        h('p', { className: 'pg-stage-sum' }, rich(stage.summary, scope(gloss))),
      ),
      visible.length
        ? h('div', { className: 'pg-steps' }, visible.map((step) => h(Step, { key: step.id + ':' + gen, step, done: !!ticks[step.id], onDone, gloss })))
        : h('p', { className: 'pg-empty' }, filter === 'todo' ? 'Nothing left to do here.' : 'Nothing ticked here yet.'),
    );
  }

  // Which stage is on screen, for the stage list beside the runbook.
  function useScrollSpy(ids) {
    const [active, setActive] = useState(null);
    const key = ids.join(' ');
    useEffect(() => {
      if (!('IntersectionObserver' in window)) return undefined;
      const els = ids.map((id) => document.getElementById('stage-' + id)).filter(Boolean);
      const seen = new Map();
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => seen.set(e.target, e.isIntersecting));
          const first = els.find((el) => seen.get(el));
          if (first) setActive(first.id.slice('stage-'.length));
        },
        { rootMargin: '-120px 0px -60% 0px' },
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
    return active;
  }

  // Two presses to clear progress; the safe choice gets focus.
  function ResetProgress({ count, onReset }) {
    const [armed, setArmed] = useState(false);
    const ref = useRef(null);
    const touched = useRef(false);
    useEffect(() => {
      if (!touched.current) return undefined;
      const box = ref.current;
      if (armed) {
        const keep = box && box.querySelector('button');
        if (keep) keep.focus();
        const t = window.setTimeout(() => setArmed(false), 8000);
        return () => window.clearTimeout(t);
      }
      const active = document.activeElement;
      const reset = box && box.querySelector('button');
      if (reset && !reset.disabled && (!active || active === document.body)) reset.focus();
      return undefined;
    }, [armed]);
    const arm = (v) => {
      touched.current = true;
      setArmed(v);
    };
    const clear = () => {
      onReset();
      arm(false);
      focusQuietly(document.getElementById('view-title'));
    };
    return h(
      'span',
      { className: 'pg-reset', ref },
      armed
        ? h(
            Fragment,
            null,
            h(DS.Button, { className: 'sm', onClick: () => arm(false) }, 'Keep my ticks'),
            h(DS.Button, { className: 'sm pg-danger', onClick: clear }, 'Clear ' + count + (count === 1 ? ' tick' : ' ticks')),
          )
        : h(DS.Button, { className: 'sm', disabled: !count, onClick: () => arm(true) }, 'Reset progress'),
    );
  }

  function RunbookView({ data, ticks, setTick, gen, onReset, route, gloss }) {
    const [filter, setFilterState] = useState('all');
    // Steps ticked or unticked under a filter stay visible until the filter changes.
    const keep = useRef(new Set());
    const setFilter = (v) => {
      keep.current = new Set();
      setFilterState(v);
    };
    const steps = allSteps(data);
    const done = steps.filter((x) => ticks[x.step.id]).length;
    const ids = data.stages.map((s) => s.id);
    const spy = useScrollSpy(ids);
    const routed = route.id && (ids.includes(route.id) ? route.id : (steps.find((x) => x.step.id === route.id) || { stage: {} }).stage.id);
    const here = spy || routed;
    const shown = (s) => filter === 'all' || keep.current.has(s.id) || s.id === route.id || (filter === 'todo' ? !ticks[s.id] : !!ticks[s.id]);
    const onDone = (id, v) => {
      keep.current.add(id);
      setTick(id, v);
    };
    return h(
      'div',
      { className: 'pg-wrap' },
      h(ViewHead, { eyebrow: 'Runbook · ' + done + ' of ' + steps.length + ' done', title: data.runbook.title, sub: data.runbook.sub, sc: scope(gloss) }),
      h(
        'div',
        { className: 'pg-runbook' },
        h(
          'nav',
          { className: 'pg-toc', 'aria-label': 'Stages' },
          h('p', { className: 'dk-eyebrow pg-eyebrow' }, 'Stages'),
          h(
            'ol',
            null,
            data.stages.map((stage, i) => {
              const s = stageStats(stage, ticks);
              return h(
                'li',
                { key: stage.id },
                h(
                  Link,
                  { to: '/runbook/' + stage.id, className: cx('pg-toc-link', s.complete && 'done'), current: here === stage.id ? 'location' : null },
                  h('span', { className: 'pg-toc-n' }, pad2(i + 1)),
                  h('span', { className: 'pg-toc-t' }, plain(stage.title)),
                  h('span', { className: 'pg-toc-c' }, s.done + '/' + s.total, h('span', { className: 'pg-sr' }, ' done')),
                ),
              );
            }),
          ),
        ),
        h(
          'div',
          { className: 'pg-runbook-main' },
          h(
            'div',
            { className: 'pg-toolbar' },
            h(DS.Segmented, {
              label: 'Show steps',
              value: filter,
              onChange: setFilter,
              options: [
                { value: 'all', label: 'All' },
                { value: 'todo', label: 'To do' },
                { value: 'done', label: 'Done' },
              ],
            }),
            h('span', { className: 'pg-sp' }),
            h(Link, { to: '/reference/labels', className: 'pg-small-link' }, 'What the labels mean'),
            h(ResetProgress, { count: done, onReset }),
          ),
          data.stages.map((stage, i) => h(StageBlock, { key: stage.id, stage, n: i + 1, ticks, gen, filter, shown, onDone, gloss })),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------- gates and reference

  function Table({ caption, cols, rows, className }) {
    return h(
      DS.Panel,
      { padded: false, className: 'pg-tablebox' },
      h(
        'table',
        { className: cx('pg-table', className), role: 'table' },
        h('caption', { className: 'pg-sr' }, caption),
        h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, cols.map((c) => h('th', { key: c, scope: 'col', role: 'columnheader' }, c)))),
        h('tbody', { role: 'rowgroup' }, rows),
      ),
    );
  }

  function Cell({ label, children }) {
    return h('td', { role: 'cell', 'data-label': label }, children);
  }

  function GatesView({ data, route, gloss }) {
    const g = data.gates;
    const sc = scope(gloss);
    const cols = ['Gate', 'Tool', 'When it runs', 'What it catches', 'Change it in'];
    return h(
      'div',
      { className: 'pg-wrap' },
      h(
        ViewHead,
        { eyebrow: 'Gates · ' + g.rows.length + ' checks', title: g.title, sub: g.sub, sc },
        h('div', { className: 'pg-ctas' }, h(Link, { to: '/home/break', className: 'dk-btn' }, 'Try them in the attack lab', h(Arrow))),
      ),
      h(Table, {
        caption: plain(g.title),
        cols,
        className: 'pg-table-gates',
        rows: g.rows.map((r) =>
          h(
            'tr',
            { key: r.id, id: 'gate-' + r.id, role: 'row', tabIndex: -1, className: cx(route.id === r.id && 'pg-hit') },
            h('th', { scope: 'row', role: 'rowheader' }, plain(r.gate)),
            h(Cell, { label: cols[1] }, h('span', { className: 'pg-tool' }, plain(r.tool))),
            h(Cell, { label: cols[2] }, rich(r.runs, sc)),
            h(Cell, { label: cols[3] }, rich(r.catches, sc)),
            h(Cell, { label: cols[4] }, h('code', { className: 'pg-code' }, plain(r.config))),
          ),
        ),
      }),
    );
  }

  function Legend() {
    return h(
      'div',
      { className: 'pg-legend' },
      LEGEND.map((group) =>
        h(
          DS.Panel,
          { key: group.title, eyebrow: group.title, className: 'pg-legend-group' },
          h(
            'ul',
            null,
            group.rows.map((r) =>
              h(
                'li',
                { key: r.chip },
                h('span', null, h(DS.Chip, { tone: LABEL_TONE[r.chip] || RISK_TONE[r.chip] || 'neutral', dot: r.chip === 'danger' }, r.chip)),
                h('span', null, r.text),
              ),
            ),
          ),
        ),
      ),
    );
  }

  function Glossary({ items, query, setQuery }) {
    const q = query.trim().toLowerCase();
    const list = q ? items.filter((g) => (g.term + ' ' + g.def + ' ' + (g.match || []).join(' ')).toLowerCase().includes(q)) : items;
    return h(
      Fragment,
      null,
      h(
        'div',
        { className: 'pg-filter' },
        h('label', { className: 'pg-filter-label', htmlFor: 'gloss-q' }, 'Filter'),
        h('input', {
          id: 'gloss-q',
          className: 'pg-input',
          type: 'search',
          value: query,
          placeholder: 'Type a word',
          autoComplete: 'off',
          spellCheck: false,
          onChange: (e) => setQuery(e.target.value),
        }),
        h('span', { className: 'pg-meta', 'aria-live': 'polite' }, list.length + ' of ' + items.length + ' terms'),
      ),
      list.length
        ? h('dl', { className: 'pg-gloss' }, list.map((g) => h('div', { key: g.term, className: 'pg-gloss-item' }, h('dt', null, g.term), h('dd', null, g.def))))
        : h('p', { className: 'pg-empty' }, 'No term matches “' + query.trim() + '”.'),
    );
  }

  function Versions({ versions }) {
    const cols = ['Tool', 'Version', 'Released', 'Pinned by', 'Used in', 'Source'];
    return h(Table, {
      caption: 'Pinned versions, checked ' + versions.asOf,
      cols,
      rows: versions.rows.map((r) =>
        h(
          'tr',
          { key: r.tool, role: 'row' },
          h('th', { scope: 'row', role: 'rowheader' }, r.tool),
          h(Cell, { label: cols[1] }, h('code', { className: 'pg-code' }, r.version)),
          h(Cell, { label: cols[2] }, h('time', { dateTime: r.released }, r.released)),
          h(Cell, { label: cols[3] }, PIN_NAMES[r.pin] || r.pin),
          h(Cell, { label: cols[4] }, plain(r.where)),
          h(Cell, { label: cols[5] }, h(Link, { href: r.source }, h('span', { className: 'pg-sr' }, r.tool + ' on '), hostOf(r.source))),
        ),
      ),
    });
  }

  function Layout({ rows, gloss }) {
    const sc = scope(gloss);
    return h(Table, {
      caption: 'Where everything lives',
      cols: ['Path', 'What it is'],
      className: 'pg-table-2',
      rows: rows.map((r) =>
        h(
          'tr',
          { key: r.path, role: 'row' },
          h('th', { scope: 'row', role: 'rowheader' }, h('code', { className: 'pg-code' }, r.path)),
          h(Cell, { label: 'What it is' }, rich(r.what, sc)),
        ),
      ),
    });
  }

  function RefSection({ id, title, sub, children }) {
    return h(
      'section',
      { className: 'pg-sec pg-refsec', id: 'ref-' + id, 'aria-labelledby': 'ref-h-' + id },
      h('div', { className: 'pg-sechead' }, h('h2', { className: 'pg-h2', id: 'ref-h-' + id, tabIndex: -1 }, title), sub ? h('p', { className: 'pg-sub' }, sub) : null),
      children,
    );
  }

  function ReferenceView({ data, route, gloss, glossQuery, setGlossQuery }) {
    return h(
      'div',
      { className: 'pg-wrap' },
      h(
        ViewHead,
        { eyebrow: 'Reference', title: data.reference.title, sub: data.reference.sub, sc: scope(gloss) },
        h(
          'nav',
          { className: 'pg-subnav', 'aria-label': 'On this page' },
          REF_SECTIONS.map(([id, label]) => h(Link, { key: id, to: '/reference/' + id, current: route.id === id ? 'location' : null }, label)),
        ),
      ),
      h(RefSection, { id: 'labels', title: 'What the labels mean', sub: 'Every runbook step shows its risk, a truth label and a confidence, so you know how far to trust it.' }, h(Legend)),
      data.flashcards.length
        ? h(
            RefSection,
            { id: 'flashcards', title: 'Test yourself', sub: 'Flip a card, then say whether you knew it. Misses come back until you do. Space flips, the arrow keys grade.' },
            h(DS.Panel, { className: 'pg-flash' }, h(DS.Flashcards, { cards: data.flashcards, title: 'Recall check' })),
          )
        : null,
      h(
        RefSection,
        { id: 'glossary', title: 'Glossary', sub: 'Plain-English meanings. Words with a dotted underline on this page show them on hover or focus.' },
        h(Glossary, { items: data.glossary, query: glossQuery, setQuery: setGlossQuery }),
      ),
      h(RefSection, { id: 'versions', title: 'Exact versions', sub: 'Everything this template pins, checked ' + data.versions.asOf + '.' }, h(Versions, { versions: data.versions })),
      h(RefSection, { id: 'layout', title: 'Where everything lives', sub: 'The files and folders you will touch, and what each one is for.' }, h(Layout, { rows: data.layout, gloss })),
    );
  }

  function MissingView() {
    return h(
      'div',
      { className: 'pg-wrap' },
      h(
        ViewHead,
        { eyebrow: 'Not found', title: 'Nothing lives at this address', sub: 'The link may be old or mistyped.' },
        h('div', { className: 'pg-ctas' }, h(Link, { to: '/', className: 'dk-btn primary' }, 'Go to Mission')),
      ),
    );
  }

  // ---------------------------------------------------------------- the app

  const VIEW_COMPONENTS = { home: HomeView, runbook: RunbookView, gates: GatesView, reference: ReferenceView };

  function App({ data }) {
    const gloss = useMemo(() => buildGlossary(data.glossary || []), [data]);
    const ids = useMemo(() => allSteps(data).map((x) => x.step.id), [data]);
    const items = useMemo(() => paletteItems(data), [data]);
    const [ticks, setTicks] = useState(() => loadTicks(ids));
    const ticksRef = useRef(ticks);
    const [gen, setGen] = useState(0);
    const [glossQuery, setGlossQuery] = useState('');
    const [message, setMessage] = useState('');
    const [theme, toggleTheme] = useTheme();
    const route = useRoute();

    const announce = (text) => {
      setMessage('');
      window.setTimeout(() => setMessage(text), 60);
    };

    useEffect(() => {
      store.set(TICKS_KEY, JSON.stringify(ticks));
    }, [ticks]);

    useEffect(() => {
      const base = plain(data.title);
      let part = VIEW_TITLES[route.view] || null;
      if (route.view === 'runbook' && route.id) {
        const hit = allSteps(data).find((x) => x.step.id === route.id);
        if (hit) part = plain(hit.step.title);
      }
      document.title = part ? part + ' · ' + base : base;
    }, [route.view, route.id, data]);

    useRouteFocus(route, announce);

    const setTick = (id, done) => {
      const prev = ticksRef.current;
      if (!!prev[id] === done) return;
      const next = { ...prev };
      if (done) next[id] = true;
      else delete next[id];
      ticksRef.current = next;
      setTicks(next);
      if (!done) return;
      const stage = data.stages.find((st) => st.steps.some((s) => s.id === id));
      if (stage && stage.steps.every((s) => next[s.id])) {
        window.requestAnimationFrame(() => {
          const el = document.getElementById('stage-' + stage.id);
          if (el) DS.celebrate(el);
        });
        const all = ids.every((x) => next[x]);
        announce('Stage done: ' + plain(stage.title) + '.' + (all ? ' Every step is done.' : ''));
      }
    };

    const resetTicks = () => {
      ticksRef.current = {};
      setTicks({});
      setGen((g) => g + 1);
      announce('Progress cleared.');
    };

    const onPick = (item) => {
      if (item.term) setGlossQuery(item.term);
      if (item.to) go(item.to);
    };

    const firstStep = ids[0] || '';
    const hint = 'No match. Try a step ID' + (firstStep ? ' like ' + firstStep : '') + ', or a word from a title.';
    const View = VIEW_COMPONENTS[route.view] || MissingView;

    return h(
      'div',
      { className: 'pg-app' },
      h(Header, { data, route, theme, toggleTheme, items, onPick, hint }),
      h(
        'main',
        { id: 'main', className: 'pg-main', tabIndex: -1 },
        h(View, { key: route.view, data, ticks, setTick, gen, onReset: resetTicks, route, gloss, glossQuery, setGlossQuery }),
      ),
      h(Footer, { data }),
      h('div', { className: 'pg-sr', role: 'status', 'aria-live': 'polite' }, message),
    );
  }

  class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
      return { error };
    }

    render() {
      if (!this.state.error) return this.props.children;
      const why = String((this.state.error && this.state.error.message) || this.state.error);
      return h(
        'div',
        { className: 'pg-wrap pg-fail' },
        h('p', { className: 'dk-eyebrow pg-eyebrow' }, 'Page error'),
        h('h1', { className: 'pg-h1 pg-h1-view' }, 'Something in the page content does not fit'),
        h('p', { className: 'pg-lede' }, 'Run make site-check: it names the field that is wrong. (' + why + ')'),
      );
    }
  }

  function Loading() {
    return h('div', { className: 'pg-loading', role: 'status' }, h('span', { className: 'pg-loading-dot', 'aria-hidden': true }), 'Loading the page…');
  }

  function LoadError({ error }) {
    const fromDisk = location.protocol === 'file:';
    const why = String((error && error.message) || error);
    return h(
      'div',
      { className: 'pg-wrap pg-fail' },
      h('p', { className: 'dk-eyebrow pg-eyebrow' }, 'Page not loaded'),
      h('h1', { className: 'pg-h1 pg-h1-view' }, fromDisk ? 'Open this page through a web server' : 'The page content did not load'),
      h(
        'p',
        { className: 'pg-lede' },
        fromDisk
          ? 'Browsers stop a page opened from disk from reading project.json. In a terminal run make preview, then open http://127.0.0.1:8000.'
          : 'project.json could not be read (' + why + '). Run make site-check to find the problem.',
      ),
    );
  }

  const root = ReactDOM.createRoot(mount);
  root.render(h(Loading));
  fetch('project.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data) => root.render(h(Boundary, null, h(App, { data }))))
    .catch((error) => root.render(h(LoadError, { error })));
})();
