// Mission Control renderer. Reads project.json and builds an interactive page:
// live gate simulator, terminal replay, glossary hovers, search, quiz, progress.
// Shared across dukecodes repos: edit project.json, not this file.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // Text fields allow `code` only. Everything else is escaped.
  const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code class="mono">$1</code>');
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
  const KEY = "mc:" + location.pathname;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: not saved */ } },
  };
  const RISK = { safe: "green", caution: "amber", destructive: "red", danger: "red" };
  const LABEL = { FACT: "teal", INFERENCE: "violet", ASSUMPTION: "amber", PROPOSAL: "violet" };
  let D, steps = [];
  const ICON = {
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3m-6 0 2 2"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    term: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  };
  const icon = (n) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ICON.spark}</svg>`;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  try { const t = localStorage.getItem("mc:theme"); if (t) root.dataset.theme = t; } catch { /* ignore */ }
  function toggleTheme() {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("mc:theme", root.dataset.theme); } catch { /* ignore */ }
  }

  /* ---------- toast + confetti ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600);
  }
  function confetti() {
    if (calm) return;
    const c = $("#confetti"), x = c.getContext("2d");
    c.width = innerWidth; c.height = innerHeight;
    const css = getComputedStyle(root);
    const cols = ["--amber", "--teal", "--green", "--violet", "--red"].map((v) => css.getPropertyValue(v).trim());
    const ps = Array.from({ length: 90 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4,
      s: 4 + Math.random() * 5, r: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0],
    }));
    let f = 0;
    (function tick() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => { p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += 0.2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); x.restore(); });
      if (++f < 110) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el) {
    const m = /^(\d+)(.*)$/.exec(el.dataset.v || "");
    if (!m || calm) { el.textContent = el.dataset.v; return; }
    const end = +m[1], t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + m[2]; if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- render ---------- */
  function progress() {
    const done = store.get();
    const n = steps.filter((s) => done[s.id]).length;
    const pct = steps.length ? Math.round((100 * n) / steps.length) : 0;
    $("#ringv").setAttribute("stroke-dasharray", pct + " 100");
    $("#ringt").textContent = pct;
    return { done, n };
  }

  function renderDynamic() {
    const { done, n } = progress();
    $("#statDone").textContent = n + "/" + steps.length;
    const cur = steps.find((s) => !done[s.id]);
    $("#next").innerHTML = (cur
      ? `<div><div class="eyebrow">Continue · ${esc(cur.id)}</div><div class="nt">${esc(cur.title)}</div></div><p>${md(cur.why)}</p><a class="btn pri" href="#${esc(cur.id)}" data-open="${esc(cur.id)}">Go to step →</a>`
      : `<div><div class="eyebrow">Status</div><div class="nt">Every step done. 🎉</div></div><p>Write down what you learned in an ADR while it's fresh.</p>`);
    $("#swarm").innerHTML = D.stages.map((s, i) => {
      const t = s.steps.length, k = s.steps.filter((x) => done[x.id]).length;
      const cls = k === t ? "done" : cur && cur.stage === s.id ? "active" : "";
      return `<a class="agent ${cls}" href="#${esc(s.steps[0].id)}" data-open="${esc(s.steps[0].id)}" style="text-decoration:none;color:inherit"><div class="an"><span>${String(i + 1).padStart(2, "0")}</span><span>${k}/${t}</span></div><div class="at">${esc(s.title)}</div><div class="bar"><i style="width:${(100 * k) / t}%"></i></div><div class="st">${k === t ? "✓ done" : cls ? "● in progress" : "queued"}</div></a>`;
    }).join("");
    $$(".step").forEach((el) => {
      const on = !!done[el.id];
      el.classList.toggle("done", on);
      $(".ck", el).checked = on;
    });
  }

  function renderStatic() {
    document.title = D.title;
    const h = D.hero || {};
    $("#badge").innerHTML = `<b>${esc(h.badge || "NEW")}</b>${esc(D.eyebrow || "")}`;
    $("#title").innerHTML = esc(D.headline[0]) + " <em>" + esc(D.headline[1]) + "</em>";
    $("#lede").innerHTML = md(D.lede);
    $("#cta").innerHTML = (h.cta || []).map((c, i) => `<a class="btn lg ${i ? "ghost" : "glow"}" href="${esc(c.href)}"${/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(c.text)}</a>`).join("");
    $("#stats").innerHTML = (D.stats || []).map((x) => `<span><b data-v="${esc(x.v)}">${esc(x.v)}</b>${esc(x.k)}</span>`).join("") + `<span><b id="statDone">0</b>steps done</span>`;
    $$("#stats b[data-v]").forEach(countUp);
    $("#bento").innerHTML = (D.features || []).map((f) => `<div class="panel tile${f.wide ? " wide" : ""}"><div class="ico">${icon(f.icon)}</div><h3>${esc(f.title)}</h3><p>${md(f.text)}</p></div>`).join("");
    $("#path").style.setProperty("--n", (D.path || []).length);
    $("#path").innerHTML = (D.path || []).map((p, i) => `<div class="pnode"><div class="n">${i + 1}</div><div class="w">${esc(p.when)}</div><h3>${esc(p.title)}</h3><p>${md(p.text)}</p></div>`).join("");
    const fin = D.final || {};
    $("#final").innerHTML = `<span class="eyebrow">${esc(fin.kicker || "")}</span><h2>${esc(fin.title || "")}</h2><p>${md(fin.text || "")}</p><div class="cta">${(fin.cta || []).map((c, i) => `<a class="btn lg ${i ? "ghost" : "glow"}" href="${esc(c.href)}"${/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(c.text)}</a>`).join("")}</div>`;
    $("#steps").innerHTML = D.stages.map((s) => `<div class="sec-h"><h2>${esc(s.title)}</h2><p>${md(s.intro || "")}</p></div>` +
      s.steps.map((st) => {
        const chips = [
          st.risk ? `<span class="chip ${RISK[st.risk] || ""}"><span class="dot"></span>${esc(st.risk)}</span>` : "",
          st.label ? `<span class="chip ${LABEL[st.label] || ""}">${esc(st.label)}</span>` : "",
          st.time ? `<span class="chip">⏱ ${esc(st.time)}</span>` : "",
        ].join("");
        const block = (h, body) => (body ? `<h4>${h}</h4>${body}` : "");
        const cmd = st.do_cmd
          ? `<pre class="cmd">${st.out ? '<button class="run" type="button">▶ run</button>' : ""}<button class="cp" type="button">copy</button><code>${esc(st.do_cmd)}</code></pre>${st.out ? '<pre class="term" hidden></pre>' : ""}`
          : "";
        return `<div class="panel step" id="${esc(st.id)}">
          <div class="sh"><input type="checkbox" class="ck" aria-label="Mark ${esc(st.title)} done" data-id="${esc(st.id)}">
          <div class="ti"><div class="sid">${esc(st.id)}</div><div class="stt">${esc(st.title)}</div><div class="chips">${chips}</div></div>
          <svg class="car" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></div>
          <div class="sb">${block("Why", `<p>${md(st.why)}</p>`)}${block("Do", `${st.do ? `<p>${md(st.do)}</p>` : ""}${cmd}`)}${block("Check it worked", st.check ? `<p>${md(st.check)}</p>` : "")}${block("Undo", st.undo ? `<p>${md(st.undo)}</p>` : "")}${st.warn ? `<div class="callout warn"><b>Careful: </b>${md(st.warn)}</div>` : ""}</div></div>`;
      }).join("")).join("");

    $("#gatecards").innerHTML = (D.gates || []).map((g) => `<div class="panel gc"><div class="eyebrow">${esc(g.where)}</div><div class="gn">${esc(g.name)}</div><p>${md(g.stops)}</p></div>`).join("");
    renderGloss("list");
    $("#foot").innerHTML = md(D.footer || "");
    renderSim();
    glossify($("main"));
  }

  /* ---------- live gate simulator ---------- */
  let runId = 0;
  function renderSim() {
    const sim = D.simulator;
    if (!sim) { $("#simWrap").hidden = true; return; }
    $("#scn").innerHTML = sim.scenarios.map((s, i) => `<button class="scn" type="button" data-s="${i}" aria-pressed="false"><span class="pl" aria-hidden="true">${esc(s.icon || "▶")}</span><span><b>${esc(s.title)}</b><small>${md(s.summary)}</small></span></button>`).join("");
    const g = sim.gates;
    $("#lane").style.setProperty("--n", g.length);
    $("#lane").innerHTML = '<div class="track"></div><div class="pkt" id="pkt"></div>' + g.map((x) => `<div class="gate" data-g="${esc(x.id)}"><div class="gw">${esc(x.where)}</div><div class="gn">${esc(x.name)}</div><div class="bar"><i style="width:0%"></i></div><div class="gs">idle</div></div>`).join("");
    const local = g.filter((x) => x.zone === "local").length;
    $("#zone").innerHTML = `<span style="--w:${local}">◂ your laptop (pre-commit) ▸</span><span style="--w:${g.length - local}">◂ GitHub (CI on every push) ▸</span>`;
  }

  async function play(i, auto = false) {
    const id = ++runId, sim = D.simulator, s = sim.scenarios[i];
    const alive = () => id === runId;
    $$(".scn").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    const log = $("#log"), pkt = $("#pkt"), gates = $$(".gate");
    log.innerHTML = ""; $("#verdict").innerHTML = "";
    gates.forEach((el) => { el.className = "gate"; $(".bar i", el).style.width = "0%"; $(".gs", el).textContent = "idle"; });
    pkt.className = "pkt on"; pkt.style.left = "0%";
    const line = (cls, txt) => { const d = document.createElement("div"); d.className = cls; d.textContent = txt; log.append(d); log.scrollTop = log.scrollHeight; };
    line("dim", "$ " + (s.cmd || 'git commit -m "my change" && git push'));
    let files = 0, rules = 0; const t0 = performance.now();
    const stat = () => { $("#simStats").innerHTML = `<span>files scanned <b>${files}</b></span><span>rules checked <b>${rules.toLocaleString()}</b></span><span>elapsed <b>${((performance.now() - t0) / 1000).toFixed(1)}s</b></span>`; };
    for (let k = 0; k < sim.gates.length; k++) {
      if (!alive()) return;
      const gd = sim.gates[k], el = gates[k];
      const lane = $("#lane").getBoundingClientRect(), r = el.getBoundingClientRect();
      pkt.style.left = ((r.left + r.width / 2 - lane.left) / lane.width) * 100 + "%";
      el.classList.add("scan"); $(".gs", el).textContent = "scanning…";
      line("warn", `[${gd.name}] ${gd.doing || "scanning"}…`);
      for (let p = 0; p <= 100; p += 20) {
        if (!alive()) return;
        $(".bar i", el).style.width = p + "%"; files += gd.files || 2; rules += gd.rules || 40; stat();
        await sleep(110);
      }
      el.classList.remove("scan");
      if (s.blockAt === gd.id) {
        el.classList.add("block"); $(".gs", el).textContent = "✕ blocked";
        pkt.classList.add("bad");
        line("bad", `[${gd.name}] ✕ ${s.finding}`);
        line("dim", "exit 1 · change stopped before it reached main");
        $$(".gate").slice(k + 1).forEach((x) => { x.classList.add("skip"); $(".gs", x).textContent = "not reached"; });
        $("#verdict").innerHTML = `<div class="callout warn"><b>Blocked at ${esc(gd.name)}. </b>${md(s.lesson)}</div>`;
        glossify($("#verdict"));
        return;
      }
      el.classList.add("pass"); $(".gs", el).textContent = "✓ pass";
      line("ok", `[${gd.name}] ✓ ${(s.pass && s.pass[gd.id]) || gd.ok || "clean"}`);
      await sleep(160);
    }
    if (!alive()) return;
    pkt.classList.add("ok");
    line("ok", "✓ all gates green · ready to merge");
    $("#verdict").innerHTML = `<div class="callout tip"><b>Merged safely. </b>${md(s.lesson)}</div>`;
    glossify($("#verdict"));
    if (!auto) confetti();
  }

  /* ---------- terminal replay ---------- */
  async function replay(btn) {
    const pre = btn.closest(".cmd"), term = pre.nextElementSibling;
    const st = steps.find((x) => x.id === pre.closest(".step").id);
    if (!term || !st) return;
    btn.disabled = true; term.hidden = false; term.textContent = "";
    const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = "$ ";
    const typed = document.createElement("span"); typed.className = "cur";
    term.append(pr, typed);
    for (const ch of st.do_cmd) { typed.textContent += ch; if (ch !== " ") await sleep(18); }
    typed.className = ""; term.append("\n");
    for (const l of st.out) { await sleep(260); term.append(l + "\n"); }
    const note = document.createElement("span"); note.style.color = "#8d9198"; note.textContent = "# example output: numbers on yours will differ"; term.append(note);
    btn.disabled = false; btn.textContent = "↻ replay";
  }

  /* ---------- glossary: hover tips, list, flashcards ---------- */
  let terms = [];
  function glossify(scope) {
    if (!terms.length || !scope) return;
    const re = new RegExp("\\b(" + terms.map((t) => t.re).join("|") + ")\\b", "i");
    const seen = new Set($$("abbr.g", document).map((a) => a.dataset.k));
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest("code,pre,abbr,button,h1,h2,h3,.gloss,.quiz,.gn,.stt,.at,.log,.term,a,input,.sec-h,.gw,.console,.badge,.eyebrow,.proof") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const m = re.exec(node.nodeValue); if (!m) continue;
      const t = terms.find((x) => new RegExp("^(" + x.re + ")$", "i").test(m[1]));
      if (!t || seen.has(t.term)) continue;
      seen.add(t.term);
      const after = node.splitText(m.index); after.splitText(m[1].length);
      const a = document.createElement("abbr"); a.className = "g"; a.dataset.k = t.term; a.tabIndex = 0; a.textContent = after.nodeValue;
      after.replaceWith(a);
    }
  }
  function tipShow(a) {
    const t = terms.find((x) => x.term === a.dataset.k); if (!t) return;
    const tip = $("#tip"); tip.replaceChildren(Object.assign(document.createElement("b"), { textContent: t.term }), document.createTextNode(t.def));
    const r = a.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(innerWidth - 310, r.left)) + "px";
    tip.style.top = (r.bottom + 8 + 120 > innerHeight ? r.top - 8 - tip.offsetHeight : r.bottom + 8) + "px";
    tip.style.opacity = 1;
  }
  const tipHide = () => { $("#tip").style.opacity = 0; };

  let quiz = { i: 0, got: 0, order: [] };
  function renderGloss(mode) {
    $$("#glossMode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const box = $("#gloss");
    if (mode === "list") {
      box.className = "gloss";
      box.innerHTML = (D.glossary || []).map((g) => `<div><b>${esc(g.term)}</b>${md(g.def)}</div>`).join("");
      return;
    }
    if (!quiz.order.length) { quiz.order = (D.glossary || []).map((_, i) => i).sort(() => Math.random() - 0.5); quiz.i = 0; quiz.got = 0; }
    const g = D.glossary[quiz.order[quiz.i % quiz.order.length]];
    box.className = "panel quiz";
    box.innerHTML = `<div class="eyebrow">Card ${(quiz.i % quiz.order.length) + 1} of ${quiz.order.length} · known ${quiz.got}</div>
      <button class="flip" type="button" id="flip" aria-label="Flip card"><span class="in"><span class="f">${esc(g.term)}</span><span class="b">${md(g.def)}</span></span></button>
      <div class="chips"><button class="btn" type="button" data-q="again">↺ Again</button><button class="btn pri" type="button" data-q="got">✓ I knew it</button></div>`;
  }

  /* ---------- ⌘K palette ---------- */
  let palIdx = 0, palItems = [];
  function palOpen() { $("#pal").classList.add("on"); $("#palq").value = ""; palSearch(""); $("#palq").focus(); }
  function palClose() { $("#pal").classList.remove("on"); }
  function palSearch(q) {
    q = q.toLowerCase();
    const all = [
      ...steps.map((s) => ({ k: s.id, t: s.title, x: s.why, go: () => openStep(s.id) })),
      ...(D.glossary || []).map((g) => ({ k: "term", t: g.term, x: g.def, go: () => { $("#glossary").scrollIntoView({ behavior: calm ? "auto" : "smooth" }); } })),
      ...(D.simulator ? D.simulator.scenarios.map((s, i) => ({ k: "simulate", t: s.title, x: s.summary, go: () => { $("#simWrap").scrollIntoView({ behavior: calm ? "auto" : "smooth" }); play(i); } })) : []),
    ];
    palItems = all.filter((a) => !q || (a.t + " " + a.x).toLowerCase().includes(q)).slice(0, 12);
    palIdx = 0;
    $("#palr").innerHTML = palItems.map((a, i) => `<div class="r${i ? "" : " on"}" data-i="${i}"><span class="k">${esc(a.k)}</span><span>${esc(a.t)}</span></div>`).join("") || '<div class="r"><span class="k"></span>No match</div>';
  }
  function openStep(id) {
    const el = document.getElementById(id); if (!el || !el.classList.contains("step")) return;
    el.classList.add("open"); el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("#theme")) return toggleTheme();
    if (t.closest("#kbtn")) return palOpen();
    if (t.id === "pal") return palClose();
    const pr = t.closest("#palr .r[data-i]"); if (pr) { palClose(); return palItems[+pr.dataset.i].go(); }
    const cp = t.closest(".cp");
    if (cp) {
      const code = cp.parentElement.querySelector("code").textContent;
      navigator.clipboard?.writeText(code).then(() => { cp.textContent = "copied"; cp.classList.add("ok"); setTimeout(() => { cp.textContent = "copy"; cp.classList.remove("ok"); }, 1400); });
      return;
    }
    const rb = t.closest(".run"); if (rb) return replay(rb);
    const sc = t.closest(".scn"); if (sc) return play(+sc.dataset.s);
    const op = t.closest("[data-open]"); if (op) { e.preventDefault(); return openStep(op.dataset.open); }
    const gm = t.closest("#glossMode button"); if (gm) return renderGloss(gm.dataset.m);
    if (t.closest("#flip")) return $("#flip").classList.toggle("on");
    const q = t.closest("[data-q]");
    if (q) {
      if (q.dataset.q === "got") quiz.got++;
      quiz.i++;
      if (quiz.i % quiz.order.length === 0) { toast(`Deck done: ${quiz.got}/${quiz.order.length} known`); if (quiz.got === quiz.order.length) confetti(); quiz.order = []; }
      return renderGloss("quiz");
    }
    const sh = t.closest(".sh"); if (sh && !t.closest(".ck")) sh.parentElement.classList.toggle("open");
  });
  document.addEventListener("change", (e) => {
    if (!e.target.matches(".ck")) return;
    const v = store.get(), id = e.target.dataset.id; v[id] = e.target.checked; store.set(v);
    const stage = D.stages.find((s) => s.steps.some((x) => x.id === id));
    renderDynamic();
    if (e.target.checked && stage.steps.every((x) => v[x.id])) { toast(`Stage complete: ${stage.title}`); confetti(); }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); return $("#pal").classList.contains("on") ? palClose() : palOpen(); }
    if (!$("#pal").classList.contains("on")) return;
    if (e.key === "Escape") palClose();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); palIdx = (palIdx + (e.key === "ArrowDown" ? 1 : -1) + palItems.length) % Math.max(1, palItems.length);
      $$("#palr .r").forEach((r, i) => r.classList.toggle("on", i === palIdx));
    }
    if (e.key === "Enter" && palItems[palIdx]) { palClose(); palItems[palIdx].go(); }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "palq") palSearch(e.target.value); });
  document.addEventListener("mouseover", (e) => { const a = e.target.closest?.("abbr.g"); if (a) tipShow(a); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest?.("abbr.g")) tipHide(); });
  document.addEventListener("focusin", (e) => { if (e.target.matches?.("abbr.g")) tipShow(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target.matches?.("abbr.g")) tipHide(); });
  addEventListener("scroll", tipHide, { passive: true });

  /* ---------- hero console: loops scenarios like a live CI feed ---------- */
  async function heroConsole() {
    const sim = D.simulator; if (!sim) return;
    const body = $("#conBody"), order = sim.heroLoop || sim.scenarios.map((_, i) => i);
    for (let n = 0; ; n++) {
      const s = sim.scenarios[order[n % order.length]], t0 = performance.now();
      body.replaceChildren(); $("#conScn").textContent = "scenario: " + s.title.toLowerCase();
      const row = (ic, cls, nm, ds) => {
        const r = document.createElement("div"); r.className = "row";
        const a = document.createElement("span"); a.className = "ic " + cls; a.textContent = ic;
        const b = document.createElement("span"); b.className = "nm"; b.textContent = nm;
        const c = document.createElement("span"); c.className = "ds"; c.textContent = ds;
        r.append(a, b, c); body.append(r); return { r, a, c };
      };
      row("$", "", s.cmd || "git push origin my-change", "").r.classList.add("cmdrow");
      let blocked = false;
      for (const g of sim.gates) {
        const x = row("◐", "run", g.name, g.doing + "…"); x.a.classList.add("spin");
        await sleep(420 + Math.random() * 380);
        x.a.classList.remove("spin", "run");
        if (s.blockAt === g.id) { x.a.textContent = "✕"; x.a.classList.add("bad"); x.c.textContent = s.finding; x.c.style.color = "#ff6b5e"; blocked = true; break; }
        x.a.textContent = "✓"; x.a.classList.add("ok"); x.c.textContent = (s.pass && s.pass[g.id]) || g.ok;
        $("#conTime").textContent = ((performance.now() - t0) / 1000).toFixed(1) + "s";
      }
      const end = row(blocked ? "■" : "→", blocked ? "bad" : "ok", blocked ? "blocked" : "ready to merge", blocked ? "fix it, then push again" : "all gates green");
      end.r.style.marginTop = "6px";
      if (calm) return;
      await sleep(3200);
    }
  }
  function reveals() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
    document.addEventListener("pointermove", (e) => {
      const t = e.target.closest?.(".tile"); if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", e.clientX - r.left + "px"); t.style.setProperty("--my", e.clientY - r.top + "px");
    });
  }

  /* ---------- boot ---------- */
  const inline = document.getElementById("project-data");
  const load = inline ? Promise.resolve(JSON.parse(inline.textContent)) : fetch("project.json").then((r) => r.json());
  load.then((d) => {
    D = d;
    steps = D.stages.flatMap((s) => s.steps.map((st) => ({ ...st, stage: s.id })));
    terms = (D.glossary || []).map((g) => ({ ...g, re: (g.match || [g.term]).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") }));
    renderStatic();
    renderDynamic();
    reveals();
    heroConsole();
    if (location.hash) openStep(location.hash.slice(1));
    if (D.simulator) {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); play(0, true); } }, { threshold: 0.4 });
      io.observe($("#simWrap"));
    }
  }).catch((err) => {
    $("#steps").innerHTML = `<div class="panel card"><b>Could not load project.json.</b> Preview with <code class="mono">python3 -m http.server -d site</code>. (${esc(err.message)})</div>`;
  });
})();
