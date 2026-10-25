"""Supply-chain rules that live in several files at once must agree.

The cooldown, tool versions and pins are written in the Makefile, pyproject.toml, the
workflows, Dependabot and the hooks file. Change one and forget another, and the repo
quietly runs two policies. These tests fail on the first drift. The project page's
headline numbers are checked against the config they describe, too.
"""

import json
import re
import tomllib
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = sorted((ROOT / ".github" / "workflows").glob("*.yml"))
SHA = r"[0-9a-f]{40}"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def days(value: str) -> int:
    match = re.fullmatch(r"(\d+) days?", value.strip())
    assert match, f"cooldown {value!r} is not written as 'N days'"
    return int(match.group(1))


def one(pattern: str, text: str, where: str) -> str:
    found: set[str] = set(re.findall(pattern, text, re.MULTILINE))
    assert len(found) == 1, f"{where}: expected one value for {pattern!r}, found {sorted(found)}"
    return found.pop()


def cooldowns() -> dict[str, int]:
    dependabot = read(".github/dependabot.yml")
    ecosystems = re.findall(r"^\s*- package-ecosystem:", dependabot, re.MULTILINE)
    per_ecosystem = re.findall(r"cooldown: \{default-days: (\d+)\}", dependabot)
    assert len(per_ecosystem) == len(ecosystems), "every Dependabot ecosystem needs a cooldown"
    pyproject = tomllib.loads(read("pyproject.toml"))
    return {
        "Makefile COOLDOWN": days(one(r"^COOLDOWN := (.+)$", read("Makefile"), "Makefile")),
        "pyproject exclude-newer": days(pyproject["tool"]["uv"]["exclude-newer"]),
        "dependabot default-days": int(one(r"default-days: (\d+)", dependabot, "dependabot")),
        "ci.yml UV_EXCLUDE_NEWER": days(
            one(r'UV_EXCLUDE_NEWER: "([^"]+)"', read(".github/workflows/ci.yml"), "ci.yml")
        ),
        "scan.sh default": days(
            one(r"\$\{UV_EXCLUDE_NEWER:-([^}]+)\}", read("scripts/scan.sh"), "scan.sh")
        ),
    }


def test_one_cooldown_everywhere() -> None:
    found = cooldowns()
    assert len(set(found.values())) == 1, found


@pytest.mark.parametrize(
    ("tool", "files"),
    [
        ("pre-commit", ["Makefile", ".github/workflows/ci.yml"]),
        ("semgrep", ["scripts/scan.sh", ".github/workflows/ci.yml"]),
    ],
)
def test_tool_versions_match_between_local_and_ci(tool: str, files: list[str]) -> None:
    versions = {f: one(rf"\b{tool}@(\d+(?:\.\d+)+)", read(f), f) for f in files}
    assert len(set(versions.values())) == 1, versions


def test_zizmor_in_ci_matches_the_hook() -> None:
    hook = one(
        rf"zizmor-pre-commit\n\s+rev: {SHA}\s+# frozen: v([\d.]+)",
        read(".pre-commit-config.yaml"),
        "hooks",
    )
    ci = one(r"\bzizmor@([\d.]+)", read(".github/workflows/ci.yml"), "ci.yml")
    assert hook == ci


@pytest.mark.parametrize("workflow", WORKFLOWS, ids=lambda p: p.name)
def test_every_action_is_pinned_to_a_full_sha(workflow: Path) -> None:
    lines = [ln.strip() for ln in workflow.read_text(encoding="utf-8").splitlines()]
    uses = [ln for ln in lines if re.match(r"(- )?uses:", ln)]
    assert uses, f"{workflow.name} uses no actions?"
    pinned = re.compile(rf"(- )?uses: [\w.-]+/[\w./-]+@{SHA} # v\d+(\.\d+)*$")
    assert [u for u in uses if not pinned.match(u)] == []


def test_every_hook_is_pinned_to_a_full_sha() -> None:
    config = read(".pre-commit-config.yaml")
    revs = re.findall(r"^\s+rev: (.+)$", config, re.MULTILINE)
    remote = re.findall(r"^\s+- repo: https://", config, re.MULTILINE)
    assert len(revs) == len(remote) > 0
    bad = [r for r in revs if not re.fullmatch(rf"{SHA}\s+# frozen: v[\w.-]+", r)]
    assert bad == []


def test_uv_is_one_exact_version_in_ci() -> None:
    for workflow in WORKFLOWS:
        text = workflow.read_text(encoding="utf-8")
        steps = text.count("astral-sh/setup-uv@")
        versions = re.findall(r"astral-sh/setup-uv@\S+.*\n\s+with:\n\s+version: \"([^\"]+)\"", text)
        assert len(versions) == steps, f"{workflow.name}: a setup-uv step has no version"
        for version in versions:
            assert re.fullmatch(r"\d+\.\d+\.\d+", version), version
        assert len(set(versions)) <= 1, versions


def commit_hooks() -> int:
    """Hooks that run on every commit: every hook id, minus manual-stage ones."""
    hooks = re.split(r"^\s+- id: ", read(".pre-commit-config.yaml"), flags=re.MULTILINE)[1:]
    return sum("stages: [manual]" not in h.split("- repo:")[0] for h in hooks)


def ci_jobs() -> int:
    jobs = read(".github/workflows/ci.yml").split("\njobs:\n", 1)[1]
    return len(re.findall(r"^  [a-z][\w-]*:\s*$", jobs, re.MULTILINE))


def test_project_page_numbers_match_the_config() -> None:
    stats = json.loads(read("site/project.json"))["hero"]["stats"]
    by_label = {s["label"]: s["value"] for s in stats}
    cooldown = next(iter(set(cooldowns().values())))
    assert by_label == {
        "checks on every commit": str(commit_hooks()),
        "CI jobs on every pull request": str(ci_jobs()),
        "wait before a new version lands": f"{cooldown} days",
    }
