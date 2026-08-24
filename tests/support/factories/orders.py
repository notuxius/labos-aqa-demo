from datetime import datetime
from typing import TypedDict
from uuid import uuid4

from labos_demo.api.models import CreateOrderRequest
from labos_demo.domain import LabOrder, OrderStatus
from tests.support.factories.datetimes import build_iso_timestamp, build_utc_datetime


class CreateOrderPayload(TypedDict):
    patient_id: str
    specimen_id: str


class OrderPayload(CreateOrderPayload):
    id: str
    status: str
    created_at: str


def build_identifier(prefix: str) -> str:
    """Return a collision-resistant synthetic identifier for one test record."""
    return f"{prefix}-{uuid4()}"


def _identifier_or_generated(value: str | None, prefix: str) -> str:
    return value if value is not None else build_identifier(prefix)


def build_create_order_payload(
    *,
    patient_id: str | None = None,
    specimen_id: str | None = None,
) -> CreateOrderPayload:
    return {
        "patient_id": _identifier_or_generated(patient_id, "PAT"),
        "specimen_id": _identifier_or_generated(specimen_id, "SPC"),
    }


def build_create_order_request(
    *,
    patient_id: str | None = None,
    specimen_id: str | None = None,
) -> CreateOrderRequest:
    return CreateOrderRequest(
        **build_create_order_payload(
            patient_id=patient_id,
            specimen_id=specimen_id,
        )
    )


def build_order_payload(
    *,
    order_id: str | None = None,
    patient_id: str | None = None,
    specimen_id: str | None = None,
    status: str = "in_progress",
    created_at: datetime | None = None,
) -> OrderPayload:
    return {
        "id": _identifier_or_generated(order_id, "ORD"),
        "patient_id": _identifier_or_generated(patient_id, "PAT"),
        "specimen_id": _identifier_or_generated(specimen_id, "SPC"),
        "status": status,
        "created_at": (
            created_at.isoformat() if created_at is not None else build_iso_timestamp()
        ),
    }


def build_malformed_order_payload() -> dict[str, object]:
    return {
        **build_order_payload(),
        "status": "unknown",
        "created_at": "not-a-timestamp",
    }


def build_order(
    *,
    order_id: str | None = None,
    patient_id: str | None = None,
    specimen_id: str | None = None,
    status: OrderStatus = OrderStatus.IN_PROGRESS,
    created_at: datetime | None = None,
) -> LabOrder:
    return LabOrder(
        id=_identifier_or_generated(order_id, "ORD"),
        patient_id=_identifier_or_generated(patient_id, "PAT"),
        specimen_id=_identifier_or_generated(specimen_id, "SPC"),
        status=status,
        created_at=created_at or build_utc_datetime(),
    )
