"""check_site guards the project page: vendored files, page content, and the browser lockdown."""

import copy
import json
import shutil
from pathlib import Path
from typing import Any

import pytest
from check_site import (
    check_contrast,
    check_index_html,
    check_lock,
    check_page_js,
    check_page_names,
    check_project,
    check_site,
    check_text_colours,
    contrast_ratio,
    main,
)

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
HTML = (SITE / "index.html").read_text(encoding="utf-8")
PROJECT: dict[str, Any] = json.loads((SITE / "project.json").read_text(encoding="utf-8"))
TOKENS: dict[str, Any] = json.loads((SITE / "ds/tokens.json").read_text(encoding="utf-8"))
CONTRAST: dict[str, Any] = json.loads((SITE / "contrast.json").read_text(encoding="utf-8"))


def project() -> dict[str, Any]:
    return copy.deepcopy(PROJECT)


def first_step(data: dict[str, Any]) -> dict[str, Any]:
    step: dict[str, Any] = data["stages"][0]["steps"][0]
    return step


def problems_mention(problems: list[str], *needles: str) -> bool:
    return any(all(n in p for n in needles) for p in problems)


def test_the_real_site_passes() -> None:
    assert check_site(ROOT) == []


# --- project.json -------------------------------------------------------------


def test_the_real_project_json_passes() -> None:
    assert check_project(project()) == []


def test_unknown_keys_are_typos() -> None:
    data = project()
    data["hero"]["ledee"] = "x"
    assert problems_mention(check_project(data), "hero.ledee")


def test_bad_risk_names_the_path() -> None:
    data = project()
    first_step(data)["risk"] = "risky"
    assert problems_mention(check_project(data), "stages[0].steps[0].risk", "risky")


def test_duplicate_step_ids_fail() -> None:
    data = project()
    data["stages"][0]["steps"].append(copy.deepcopy(first_step(data)))
    assert problems_mention(check_project(data), "duplicate step id")


def test_step_ids_start_with_their_stage() -> None:
    data = project()
    first_step(data)["id"] = "zzz-01"
    assert problems_mention(check_project(data), "zzz-01")


def test_attacks_must_name_a_real_gate() -> None:
    data = project()
    data["simulator"]["attacks"][0]["g"] = "nope"
    assert problems_mention(check_project(data), "simulator.attacks[0].g", "nope")


def test_console_fail_index_must_be_a_stage() -> None:
    data = project()
    scn = data["console"]["scenarios"][0]
    scn["fail"] = len(scn["stages"])
    scn["why"] = "x"
    assert problems_mention(check_project(data), "console.scenarios[0].fail")


def test_console_lines_must_cover_each_stage() -> None:
    data = project()
    data["console"]["scenarios"][0]["lines"].pop()
    assert problems_mention(check_project(data), "console.scenarios[0].lines")


def test_a_blocked_console_run_needs_the_fix() -> None:
    data = project()
    blocked = next(s for s in data["console"]["scenarios"] if s["fail"] is not None)
    del blocked["why"]
    assert problems_mention(check_project(data), "why")


@pytest.mark.parametrize(
    "url", ["javascript:alert(1)", "http://example.com", "data:text/html,x", "//x.io"]
)
def test_links_must_be_https(url: str) -> None:
    data = project()
    first_step(data)["sources"] = [{"title": "x", "url": url}]
    assert problems_mention(check_project(data), "url")


def test_routes_must_point_at_something_real() -> None:
    data = project()
    data["hero"]["ctas"][0]["to"] = "/runbook/zzz-99"
    assert problems_mention(check_project(data), "hero.ctas[0].to", "zzz-99")


def test_unbalanced_backticks_fail() -> None:
    data = project()
    first_step(data)["why"] = "Run `make check to see"
    assert problems_mention(check_project(data), "backtick")


def test_plain_text_fields_reject_backticks() -> None:
    data = project()
    data["flashcards"][0]["q"] = "What does `x` do?"
    assert problems_mention(check_project(data), "flashcards[0].q")


def test_every_step_has_a_truth_label_and_an_undo() -> None:
    data = project()
    del first_step(data)["label"]
    del first_step(data)["undo"]
    problems = check_project(data)
    assert problems_mention(problems, "label")
    assert problems_mention(problems, "undo")


# --- index.html ---------------------------------------------------------------


def test_the_real_index_html_passes() -> None:
    assert check_index_html(HTML, SITE) == []


def test_missing_csp_fails() -> None:
    start = HTML.index('<meta http-equiv="Content-Security-Policy"')
    end = HTML.index(">", start) + 1
    assert problems_mention(check_index_html(HTML[:start] + HTML[end:]), "Content-Security-Policy")


def test_weakened_csp_fails() -> None:
    weak = HTML.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
    assert problems_mention(check_index_html(weak), "script-src")


def test_inline_script_fails() -> None:
    bad = HTML.replace("</body>", "<script>alert(1)</script></body>")
    assert problems_mention(check_index_html(bad), "inline")


def test_external_script_fails() -> None:
    bad = HTML.replace('src="app.js"', 'src="https://cdn.example/app.js"')
    assert problems_mention(check_index_html(bad), "https://cdn.example/app.js")


def test_style_attributes_and_blocks_fail() -> None:
    bad = HTML.replace('<div id="root">', '<div id="root" style="color:red"><style>p{}</style>')
    problems = check_index_html(bad)
    assert problems_mention(problems, "style attribute")
    assert problems_mention(problems, "<style>")


def test_event_handler_attributes_fail() -> None:
    bad = HTML.replace('<div id="root">', '<div id="root" onclick="x()">')
    assert problems_mention(check_index_html(bad), "onclick")


def test_csp_must_come_before_any_script_or_style() -> None:
    meta_start = HTML.index('<meta http-equiv="Content-Security-Policy"')
    meta = HTML[meta_start : HTML.index(">", meta_start) + 1]
    moved = HTML.replace(meta, "").replace("</head>", meta + "</head>")
    assert problems_mention(check_index_html(moved), "before")


def test_missing_local_file_fails() -> None:
    bad = HTML.replace('src="app.js"', 'src="nope.js"')
    assert problems_mention(check_index_html(bad, SITE), "nope.js")


FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400&amp;display=swap"


def with_tag(tag: str) -> str:
    return HTML.replace("</head>", tag + "</head>")


def test_the_google_fonts_sheet_is_the_only_outside_file() -> None:
    assert check_index_html(with_tag(f'<link rel="stylesheet" href="{FONTS}">')) == []


@pytest.mark.parametrize(
    "tag",
    [
        '<link rel="stylesheet" href="https://evil.example/x.css">',
        '<link rel="preload" href="https://fonts.googleapis.com/css2?family=X">',
        '<link rel="stylesheet" href="https://fonts.googleapis.com.evil.example/css2?family=X">',
        '<link rel="stylesheet" href="http://fonts.googleapis.com/css2?family=X">',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=X">',
        '<link rel="stylesheet" href="https://user@fonts.googleapis.com/css2?family=X">',
        '<script src="https://fonts.googleapis.com/css2?family=X"></script>',
    ],
)
def test_any_other_outside_file_fails(tag: str) -> None:
    assert check_index_html(with_tag(tag)) != []


# --- vendored files -----------------------------------------------------------


@pytest.fixture
def site_copy(tmp_path: Path) -> Path:
    shutil.copytree(SITE, tmp_path / "site")
    return tmp_path


def test_tampered_vendored_file_fails(site_copy: Path) -> None:
    bundle = site_copy / "site/ds/bundle.js"
    bundle.write_bytes(bundle.read_bytes() + b"\n")
    assert problems_mention(check_lock(site_copy), "site/ds/bundle.js", "sha256")


def test_unlisted_vendored_file_fails(site_copy: Path) -> None:
    (site_copy / "site/vendor/react-18.3.1/extra.js").write_text("x", encoding="utf-8")
    assert problems_mention(check_lock(site_copy), "extra.js")


def test_stale_tokens_css_fails(site_copy: Path) -> None:
    css = site_copy / "site/ds/tokens.css"
    css.write_text(css.read_text(encoding="utf-8") + "/* edit */\n", encoding="utf-8")
    assert problems_mention(check_lock(site_copy), "tokens.css")


def test_main_reports_then_relock_accepts_a_deliberate_sync(
    site_copy: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    assert main(["--root", str(site_copy)]) == 0
    assert "site OK" in capsys.readouterr().out
    readme = site_copy / "site/ds/README.md"
    readme.write_bytes(readme.read_bytes() + b"\nsynced\n")
    assert main(["--root", str(site_copy)]) == 1
    assert "README.md" in capsys.readouterr().err
    assert main(["--root", str(site_copy), "--relock"]) == 0


# --- other files Pages publishes ----------------------------------------------


def test_broken_project_json_is_reported(site_copy: Path) -> None:
    (site_copy / "site/project.json").write_text("{", encoding="utf-8")
    assert problems_mention(check_site(site_copy), "project.json")


def test_a_page_without_project_json_skips_only_its_schema(
    site_copy: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    # Other repos (the roadmap) reuse this checker with their own page data.
    (site_copy / "site/project.json").unlink()
    assert check_site(site_copy) == []
    assert main(["--root", str(site_copy)]) == 0
    assert "schema skipped" in capsys.readouterr().out
    (site_copy / "site/app.css").write_text(
        '@import url("https://evil.example/x.css");\n', encoding="utf-8"
    )
    assert problems_mention(check_site(site_copy), "app.css", "@import")


def test_every_html_page_needs_the_lockdown(site_copy: Path) -> None:
    (site_copy / "site/other.html").write_text("<!doctype html><title>x</title>", encoding="utf-8")
    assert problems_mention(check_site(site_copy), "other.html", "Content-Security-Policy")


def test_svg_cannot_carry_script(site_copy: Path) -> None:
    svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    (site_copy / "site/favicon.svg").write_text(svg, encoding="utf-8")
    assert problems_mention(check_site(site_copy), "favicon.svg", "script")


def test_page_css_cannot_pull_in_outside_files(site_copy: Path) -> None:
    css = site_copy / "site/app.css"
    css.write_text('@import url("https://evil.example/x.css");\n' + css.read_text(encoding="utf-8"))
    assert problems_mention(check_site(site_copy), "app.css", "@import")


def test_design_system_css_cannot_import_fonts_either(site_copy: Path) -> None:
    css = site_copy / "site/ds/bundle.css"
    fonts = '@import url("https://fonts.googleapis.com/css2?family=X");\n'
    css.write_text(fonts + css.read_text(encoding="utf-8"), encoding="utf-8")
    assert problems_mention(check_site(site_copy), "site/ds/bundle.css", "@import")


# --- page scripts -------------------------------------------------------------


@pytest.mark.parametrize(
    "code",
    [
        "el.innerHTML = x",
        "el.outerHTML = x",
        "el.insertAdjacentHTML('beforeend', x)",
        "document.write(x)",
        "eval(x)",
        "new Function('return 1')",
        "h('div', {dangerouslySetInnerHTML: {__html: x}})",
        "setTimeout('alert(1)', 10)",
        "fetch('http://example.com/x')",
        "new RegExp(x)",
        "RegExp(words.join('|'), 'g')",
        "new RegExp('(?:' + word + ')', 'gi')",
        "new RegExp(`${word}`)",
        "frame.srcdoc = x",
        "h('iframe', {srcDoc: x})",
        "el.setAttribute('srcdoc', x)",
    ],
)
def test_html_and_code_sinks_in_page_scripts_fail(code: str) -> None:
    assert check_page_js("app.js", code) != []


def test_plain_dom_code_passes() -> None:
    assert check_page_js("app.js", "el.textContent = x; fetch('project.json')") == []


def test_a_regexp_from_a_literal_passes() -> None:
    code = "new RegExp('^[a-z]+$', 'i'); RegExp(\"a\\\"b\"); new RegExp(/x\\/y/g, 'm')"
    assert check_page_js("app.js", code) == []


def test_a_comment_that_names_srcdoc_passes() -> None:
    assert check_page_js("bundle.js", "/* works in about:blank/srcdoc frames */") == []


# --- colours and names --------------------------------------------------------


def pairs(*page: dict[str, Any]) -> dict[str, Any]:
    """A contrast file whose design-system list is one known-good pair."""
    return {
        "designSystem": {"pairs": [{"fg": "ink-100", "on": ["bg-100"]}]},
        "page": {"pairs": list(page)},
    }


def test_contrast_ratio_matches_wcag() -> None:
    assert contrast_ratio("#000000", "#ffffff") == pytest.approx(21.0)
    assert contrast_ratio("#777", "#fff") == pytest.approx(4.48, abs=0.01)
    assert contrast_ratio("#ffffff", "#000000") == contrast_ratio("#000000", "#ffffff")


def test_the_real_contrast_pairs_pass() -> None:
    assert check_contrast(TOKENS, CONTRAST) == []


def test_a_low_contrast_pair_names_the_theme() -> None:
    problems = check_contrast(TOKENS, pairs({"fg": "ink-300", "on": ["bg-100"]}))
    assert problems_mention(problems, "ink-300", "bg-100", "light")


def test_large_text_may_ask_for_3_to_1() -> None:
    assert check_contrast(TOKENS, pairs({"fg": "ink-300", "on": ["bg-100"], "min": 3})) == []


def test_a_pair_that_names_a_missing_token_fails() -> None:
    problems = check_contrast(TOKENS, pairs({"fg": "on-amber", "on": ["amber"]}))
    assert problems_mention(problems, "on-amber")


def test_a_see_through_colour_cannot_be_checked() -> None:
    tokens = copy.deepcopy(TOKENS)
    tokens["color"]["tokens"].append({"name": "glass", "value": "rgba(0,0,0,0.5)"})
    problems = check_contrast(tokens, pairs({"fg": "glass", "on": ["bg-100"]}))
    assert problems_mention(problems, "glass", "opaque")


@pytest.mark.parametrize(
    "bad",
    [
        {},
        {"page": {"pairs": []}},
        pairs({"fg": "ink-100"}),
        pairs({"fg": "ink-100", "on": "bg-100"}),
    ],
)
def test_a_malformed_contrast_file_fails(bad: dict[str, Any]) -> None:
    assert check_contrast(TOKENS, bad) != []


def test_the_page_uses_only_real_tokens_and_classes() -> None:
    assert check_page_names(SITE) == []


def test_a_token_the_design_system_dropped_fails(site_copy: Path) -> None:
    css = site_copy / "site/app.css"
    css.write_text(css.read_text(encoding="utf-8") + ".x { color: var(--on-amber); }\n")
    assert problems_mention(check_page_names(site_copy / "site"), "on-amber")


def test_a_class_the_design_system_renamed_fails(site_copy: Path) -> None:
    css, js = site_copy / "site/app.css", site_copy / "site/app.js"
    css.write_text(css.read_text(encoding="utf-8") + ".dk-nope { margin: 0; }\n")
    js.write_text(js.read_text(encoding="utf-8") + "h('div', {className: 'dk-gone'});\n")
    problems = check_page_names(site_copy / "site")
    assert problems_mention(problems, "app.css", "dk-nope")
    assert problems_mention(problems, "app.js", "dk-gone")


def test_every_page_text_colour_has_a_contrast_pair() -> None:
    css = (SITE / "app.css").read_text(encoding="utf-8")
    assert check_text_colours(css, CONTRAST) == []


def test_a_text_colour_with_no_contrast_pair_fails() -> None:
    assert problems_mention(check_text_colours(".x { color: var(--violet); }", CONTRAST), "violet")


def test_the_site_check_runs_the_colour_checks(site_copy: Path) -> None:
    path = site_copy / "site/contrast.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["page"]["pairs"].append({"fg": "ink-300", "on": ["bg-100"]})
    path.write_text(json.dumps(data), encoding="utf-8")
    assert problems_mention(check_site(site_copy), "contrast.json", "ink-300")
