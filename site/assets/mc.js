// Mission Control renderer. Reads project.json and fills the page.
// Shared across dukecodes repos: edit project.json, not this file.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // Text fields allow `code` only. Everything else is escaped.
  const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code class=\"mono\">$1</code>");
  const KEY = "mc:" + location.pathname;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: progress not saved */ } },
  };
  const RISK = { safe: "green", caution: "amber", destructive: "red", danger: "red" };
  const LABEL = { FACT: "teal", INFERENCE: "violet", ASSUMPTION: "amber", PROPOSAL: "violet" };

  // theme toggle: system by default, remembered per viewer
  const root = document.documentElement;
  try { const t = localStorage.getItem("mc:theme"); if (t) root.dataset.theme = t; } catch { /* ignore */ }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#theme")) return;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("mc:theme", root.dataset.theme); } catch { /* ignore */ }
  });

  function render(d) {
    const done = store.get();
    const steps = d.stages.flatMap((s) => s.steps.map((st) => ({ ...st, stage: s.id })));
    const nDone = steps.filter((s) => done[s.id]).length;
    document.title = d.title;
    $("#eyebrow").textContent = d.eyebrow || "";
    $("#title").innerHTML = esc(d.headline[0]) + "<br><em>" + esc(d.headline[1]) + "</em>";
    $("#lede").innerHTML = md(d.lede);
    $("#stats").innerHTML = [
      ...(d.stats || []).map((s) => [s.v, s.k]),
      [nDone + "/" + steps.length, "steps done"],
    ].map(([v, k]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join("");

    const tags = (d.tags || []).length ? `<div class="eyebrow" style="margin-top:auto">Built with</div><div class="chips">${d.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : "";
    const cur = steps.find((s) => !done[s.id]);
    $("#next").innerHTML = cur
      ? `<div class="eyebrow">Next step</div><div class="nt">${esc(cur.title)}</div><p style="margin:0;color:var(--ink2)">${md(cur.why)}</p><div><a class="btn pri" href="#${esc(cur.id)}">Go to step</a></div>` + tags
      : `<div class="eyebrow">Status</div><div class="nt">All steps done.</div><p style="margin:0;color:var(--ink2)">Record what you learned in docs/adr/.</p>` + tags;

    $("#swarm").innerHTML = d.stages.map((s, i) => {
      const t = s.steps.length, k = s.steps.filter((x) => done[x.id]).length;
      const cls = k === t ? "done" : cur && cur.stage === s.id ? "active" : "";
      return `<a class="agent ${cls}" href="#${esc(s.steps[0].id)}" style="text-decoration:none;color:inherit"><div class="an"><span>${String(i + 1).padStart(2, "0")}</span><span>${k}/${t}</span></div><div class="at">${esc(s.title)}</div><div class="bar"><i style="width:${(100 * k) / t}%"></i></div><div class="st">${k === t ? "done" : cls ? "in progress" : "queued"}</div></a>`;
    }).join("");

    $("#steps").innerHTML = d.stages.map((s) => `<div class="sec-h"><h2>${esc(s.title)}</h2><p>${md(s.intro || "")}</p></div>` +
      s.steps.map((st) => {
        const chips = [
          st.risk ? `<span class="chip ${RISK[st.risk] || ""}"><span class="dot"></span>${esc(st.risk)}</span>` : "",
          st.label ? `<span class="chip ${LABEL[st.label] || ""}">${esc(st.label)}</span>` : "",
          st.time ? `<span class="chip">${esc(st.time)}</span>` : "",
        ].join("");
        const block = (h, body) => (body ? `<h4>${h}</h4>${body}` : "");
        const cmd = st.do_cmd ? `<pre class="cmd"><button class="cp" type="button">copy</button><code>${esc(st.do_cmd)}</code></pre>` : "";
        return `<div class="panel step ${done[st.id] ? "done" : ""}" id="${esc(st.id)}">
          <div class="sh"><input type="checkbox" class="ck" aria-label="Mark done" ${done[st.id] ? "checked" : ""} data-id="${esc(st.id)}">
          <div class="ti"><div class="sid">${esc(st.id)}</div><div class="stt">${esc(st.title)}</div><div class="chips">${chips}</div></div>
          <svg class="car" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></div>
          <div class="sb">${block("Why", `<p>${md(st.why)}</p>`)}${block("Do", `<p>${md(st.do || "")}</p>${cmd}`)}${block("Check it worked", st.check ? `<p>${md(st.check)}</p>` : "")}${block("Undo", st.undo ? `<p>${md(st.undo)}</p>` : "")}${st.warn ? `<div class="callout warn"><b>Careful: </b>${md(st.warn)}</div>` : ""}</div></div>`;
      }).join("")).join("");

    $("#gates").innerHTML = `<tr><th>Gate</th><th>Stops</th><th>Runs</th></tr>` +
      (d.gates || []).map((g) => `<tr><td><b>${esc(g.name)}</b></td><td>${md(g.stops)}</td><td class="mono">${esc(g.where)}</td></tr>`).join("");
    $("#gloss").innerHTML = (d.glossary || []).map((g) => `<div><b>${esc(g.term)}</b>${md(g.def)}</div>`).join("");
    $("#foot").innerHTML = md(d.footer || "");
  }

  document.addEventListener("click", (e) => {
    const cp = e.target.closest(".cp");
    if (cp) {
      navigator.clipboard?.writeText(cp.nextElementSibling.textContent).then(() => { cp.textContent = "copied"; cp.classList.add("ok"); setTimeout(() => { cp.textContent = "copy"; cp.classList.remove("ok"); }, 1400); });
      return;
    }
    const sh = e.target.closest(".sh");
    if (sh && !e.target.closest(".ck")) sh.parentElement.classList.toggle("open");
  });
  document.addEventListener("change", (e) => {
    if (!e.target.matches(".ck")) return;
    const v = store.get(); v[e.target.dataset.id] = e.target.checked; store.set(v);
    render(window.__mc);
  });

  const inline = document.getElementById("project-data");
  const load = inline ? Promise.resolve(JSON.parse(inline.textContent)) : fetch("project.json").then((r) => r.json());
  load.then((d) => { window.__mc = d; render(d); })
    .catch((err) => { $("#steps").innerHTML = `<div class="panel card"><b>Could not load project.json.</b> Preview with <code class="mono">python3 -m http.server -d site</code>. (${esc(err.message)})</div>`; });
})();
