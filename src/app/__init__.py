"""Starter package. Replace with real code; keep the test pattern."""

import ipaddress


def in_network(addr: str, cidr: str) -> bool:
    """Return True if addr is inside cidr. Raises ValueError on bad input."""
    return ipaddress.ip_address(addr) in ipaddress.ip_network(cidr, strict=True)
