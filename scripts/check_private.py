"""Keep real network details out of git: private addresses and tailnet names.

What a repo holds can end up public, and a page built from it is public by design. A
private address (10/8, 172.16/12, 192.168/16), a Tailscale address (100.64/10, the
carrier-grade NAT range) or a tailnet name (a name ending in .ts.net) maps a real
network. Write the documentation ranges instead: 192.0.2.0/24, 198.51.100.0/24 and
203.0.113.0/24 (RFC 5737), and <machine>.<tailnet>.ts.net for names.

The ranges below are built from numbers, so this file passes its own scan. A commit hook
runs it on every file (vendored ones too: a copied design system once carried a real
LAN plan). Standard library only.

Usage:  python scripts/check_private.py FILE...
"""

from __future__ import annotations

import ipaddress
import re
import sys
from pathlib import Path

PRIVATE = tuple(
    ipaddress.IPv4Network((base, prefix))
    for base, prefix in (
        (10 << 24, 8),
        (172 << 24 | 16 << 16, 12),
        (192 << 24 | 168 << 16, 16),
        (100 << 24 | 64 << 16, 10),
    )
)
# Four numbers joined by dots, not inside a longer run of numbers and dots (a version
# such as 1.10.0.12.4 is not an address). A full stop after the address still counts.
DOTTED = re.compile(r"(?<![\w.])\d{1,3}(?:\.\d{1,3}){3}(?!\w|\.\d)")
TAILNET = re.compile(
    r"(?<![\w.-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+ts\.net(?![\w-])", re.IGNORECASE
)


def _is_private(text: str) -> bool:
    try:
        addr = ipaddress.IPv4Address(text)
    except ValueError:  # an octet over 255: not an address
        return False
    return any(addr in net for net in PRIVATE)


def find_private(text: str) -> list[tuple[int, str]]:
    """(line, value) for every private address and tailnet name in text."""
    found = []
    for n, line in enumerate(text.splitlines(), start=1):
        hits = [(m.start(), m.group(0)) for m in DOTTED.finditer(line) if _is_private(m.group(0))]
        hits += [(m.start(), m.group(0)) for m in TAILNET.finditer(line)]
        found += [(n, value) for _, value in sorted(hits)]
    return found


def main(argv: list[str] | None = None) -> int:
    problems = []
    for name in sys.argv[1:] if argv is None else argv:
        try:
            raw = Path(name).read_bytes()
        except OSError as err:
            problems.append(f"{name}: cannot read it: {err}")
            continue
        if b"\0" in raw:  # binary: images, archives
            continue
        for line, value in find_private(raw.decode("utf-8", errors="replace")):
            fix = (
                "write <machine>.<tailnet>.ts.net"
                if value.lower().endswith(".ts.net")
                else "use an example from 192.0.2.0/24 (RFC 5737)"
            )
            problems.append(f"{name}:{line}: {value} is a real network detail; {fix}")
    for problem in problems:
        print(problem, file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
