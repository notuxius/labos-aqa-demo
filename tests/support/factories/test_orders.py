from datetime import UTC, datetime

from tests.support.factories.orders import build_order_payload


def test_order_factory_generates_unique_records_with_utc_timestamp() -> None:
    first = build_order_payload()
    second = build_order_payload()

    first_created_at = datetime.fromisoformat(first["created_at"])

    assert first["id"] != second["id"]
    assert first["patient_id"] != second["patient_id"]
    assert first["specimen_id"] != second["specimen_id"]
    assert first_created_at.tzinfo is UTC
