import pytest

from app import in_network


def test_inside() -> None:
    assert in_network("192.0.2.5", "192.0.2.0/24")


def test_outside() -> None:
    assert not in_network("198.51.100.1", "192.0.2.0/24")


def test_rejects_garbage() -> None:
    with pytest.raises(ValueError):
        in_network("not-an-ip", "192.0.2.0/24")
