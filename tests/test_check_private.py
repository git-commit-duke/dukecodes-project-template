"""check_private keeps real network details out of git: private addresses and tailnet names.

The private addresses here are built from numbers, so this file passes its own scan.
"""

import shutil
import subprocess
from pathlib import Path

import pytest
from check_private import find_private, main

ROOT = Path(__file__).resolve().parents[1]


def ip(*octets: int) -> str:
    return ".".join(str(o) for o in octets)


@pytest.mark.parametrize(
    "addr",
    [
        ip(10, 10, 0, 1),
        ip(172, 16, 4, 2),
        ip(172, 31, 255, 254),
        ip(192, 168, 8, 1),
        ip(100, 64, 0, 1),  # Tailscale hands out addresses from the carrier-grade NAT range
        ip(100, 127, 255, 254),
    ],
)
def test_private_and_tailnet_addresses_fail(addr: str) -> None:
    assert find_private(f"The router is at {addr}.") == [(1, addr)]


@pytest.mark.parametrize(
    "addr",
    [
        ip(192, 0, 2, 10),  # RFC 5737 documentation ranges: use these instead
        ip(198, 51, 100, 7),
        ip(203, 0, 113, 9),
        ip(127, 0, 0, 1),
        ip(172, 32, 0, 1),
        ip(100, 128, 0, 1),
        ip(8, 8, 8, 8),
    ],
)
def test_documentation_loopback_and_public_addresses_pass(addr: str) -> None:
    assert find_private(f"See {addr} for the example.") == []


def test_a_network_range_counts() -> None:
    assert find_private("LAN " + ip(10, 10, 0, 0) + "/24") == [(1, ip(10, 10, 0, 0))]


def test_version_numbers_are_not_addresses() -> None:
    text = "v" + ip(1, 10, 0, 12) + ", build " + ip(10, 1, 2, 3) + ".4, and " + ip(999, 168, 1, 1)
    assert find_private(text) == []


def test_findings_carry_their_line_number() -> None:
    assert find_private("one\ntwo " + ip(192, 168, 1, 1)) == [(2, ip(192, 168, 1, 1))]


def test_tailnet_names_fail() -> None:
    name = "nas." + "tail" + "1234" + ".ts" + ".net"
    assert find_private("ssh root@" + name) == [(1, name)]


def test_tailnet_placeholders_pass() -> None:
    assert find_private("MagicDNS names look like <machine>.<tailnet>.ts.net, or *.ts.net") == []


def test_main_names_the_file_and_the_fix(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    good = tmp_path / "ok.md"
    good.write_text("LAN " + ip(192, 0, 2, 1) + "\n", encoding="utf-8")
    bad = tmp_path / "notes.md"
    bad.write_text("fine\nLAN " + ip(10, 0, 0, 1) + "\n", encoding="utf-8")
    assert main([str(good)]) == 0
    assert main([str(good), str(bad)]) == 1
    err = capsys.readouterr().err
    assert "notes.md:2" in err
    assert ip(192, 0, 2, 0) + "/24" in err


def test_binary_files_are_skipped(tmp_path: Path) -> None:
    blob = tmp_path / "x.bin"
    blob.write_bytes(b"\x00\x01" + ip(10, 0, 0, 1).encode())
    assert main([str(blob)]) == 0


def test_this_repo_holds_no_real_network_details() -> None:
    git = shutil.which("git")
    if git is None:
        pytest.skip("git is not installed")
    # A fixed git command with no outside input.
    listed = subprocess.run(  # noqa: S603
        [git, "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    files = [ROOT / f for f in listed.split("\0") if f and (ROOT / f).is_file()]
    assert main([str(f) for f in files]) == 0
