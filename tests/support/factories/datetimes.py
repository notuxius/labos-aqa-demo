from datetime import UTC, datetime, timedelta
from secrets import randbelow

DEFAULT_LOOKBACK = timedelta(days=30)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("Datetime factory boundaries must be timezone-aware")
    return value.astimezone(UTC)


def build_utc_datetime(
    *,
    earliest: datetime | None = None,
    latest: datetime | None = None,
) -> datetime:
    """Return a random UTC datetime inside an inclusive range.

    The default range covers the previous 30 days, which produces realistic
    creation times without leaking a shared fixed timestamp across tests.
    """
    latest_utc = _as_utc(latest) if latest is not None else datetime.now(UTC)
    earliest_utc = (
        _as_utc(earliest) if earliest is not None else latest_utc - DEFAULT_LOOKBACK
    )
    if earliest_utc > latest_utc:
        raise ValueError("earliest must not be later than latest")

    range_microseconds = (latest_utc - earliest_utc) // timedelta(microseconds=1)
    if range_microseconds == 0:
        return earliest_utc
    return earliest_utc + timedelta(microseconds=randbelow(range_microseconds + 1))


def build_iso_timestamp(
    *,
    earliest: datetime | None = None,
    latest: datetime | None = None,
) -> str:
    """Return a random UTC datetime serialized as an ISO 8601 timestamp."""
    return build_utc_datetime(earliest=earliest, latest=latest).isoformat()
