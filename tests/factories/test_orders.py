from datetime import UTC, datetime

from tests.factories.orders import build_order_payload


def test_order_factory_generates_unique_current_records() -> None:
    started_at = datetime.now(UTC)

    first = build_order_payload()
    second = build_order_payload()

    completed_at = datetime.now(UTC)
    first_created_at = datetime.fromisoformat(first["created_at"])

    assert first["id"] != second["id"]
    assert first["patient_id"] != second["patient_id"]
    assert first["specimen_id"] != second["specimen_id"]
    assert started_at <= first_created_at <= completed_at
