from datetime import UTC, datetime, timedelta

import pytest

from tests.support.factories.datetimes import build_iso_timestamp, build_utc_datetime


def test_datetime_factory_generates_value_inside_utc_range() -> None:
    latest = datetime.now(UTC)
    earliest = latest - timedelta(days=1)

    generated = build_utc_datetime(earliest=earliest, latest=latest)

    assert earliest <= generated <= latest
    assert generated.tzinfo is UTC


def test_datetime_factory_serializes_iso_timestamp() -> None:
    generated = datetime.fromisoformat(build_iso_timestamp())

    assert generated.tzinfo is UTC


def test_datetime_factory_rejects_naive_boundaries() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        build_utc_datetime(earliest=datetime.now())


def test_datetime_factory_rejects_reversed_range() -> None:
    earliest = datetime.now(UTC)

    with pytest.raises(ValueError, match="earliest"):
        build_utc_datetime(earliest=earliest, latest=earliest - timedelta(seconds=1))
