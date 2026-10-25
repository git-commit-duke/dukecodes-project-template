"""The style guide, the page's label legend and the page checker name the same labels.

docs/STYLE.md tells writers what FACT or `caution` mean; site/app.js shows readers the
same words under Reference > Labels; scripts/check_site.py accepts only those labels in
project.json. Three copies drift unless something compares them.
"""

import re
from pathlib import Path

import check_site

ROOT = Path(__file__).resolve().parents[1]


def style_guide_rows() -> dict[str, str]:
    text = (ROOT / "docs" / "STYLE.md").read_text(encoding="utf-8")
    return dict(re.findall(r"^\| `([A-Za-z]+)` \| ([^|]+?) \|$", text, re.MULTILINE))


def page_legend_rows() -> dict[str, str]:
    js = (ROOT / "site" / "app.js").read_text(encoding="utf-8")
    legend = js.split("const LEGEND = [", 1)[1].split("\n  ];", 1)[0]
    rows = re.findall(r"\{ chip: '(\w+)', text: (?:'([^']*)'|\"([^\"]*)\") \}", legend)
    return {chip: single or double for chip, single, double in rows}


def test_style_guide_and_page_legend_say_the_same_thing() -> None:
    legend = page_legend_rows()
    assert len(legend) == 12
    assert style_guide_rows() == legend


def test_page_checker_accepts_exactly_the_documented_labels() -> None:
    accepted = {*check_site.LABELS, *check_site.CONFIDENCE, *check_site.RISKS}
    assert accepted == set(style_guide_rows())
