from datetime import UTC, datetime
from typing import TypedDict

from labos_demo.api.models import CreateOrderRequest
from labos_demo.domain import LabOrder, OrderStatus


class CreateOrderPayload(TypedDict):
    patient_id: str
    specimen_id: str


class OrderPayload(CreateOrderPayload):
    id: str
    status: str
    created_at: str


def build_create_order_payload(
    *,
    patient_id: str = "PAT-7",
    specimen_id: str = "SPC-99",
) -> CreateOrderPayload:
    return {"patient_id": patient_id, "specimen_id": specimen_id}


def build_create_order_request(
    *,
    patient_id: str = "PAT-7",
    specimen_id: str = "SPC-99",
) -> CreateOrderRequest:
    return CreateOrderRequest(patient_id=patient_id, specimen_id=specimen_id)


def build_order_payload(
    *,
    order_id: str = "ORD-42",
    patient_id: str = "PAT-7",
    specimen_id: str = "SPC-99",
    status: str = "in_progress",
    created_at: str = "2026-08-21T08:00:00Z",
) -> OrderPayload:
    return {
        "id": order_id,
        "patient_id": patient_id,
        "specimen_id": specimen_id,
        "status": status,
        "created_at": created_at,
    }


def build_malformed_order_payload() -> dict[str, object]:
    return {
        **build_order_payload(),
        "status": "unknown",
        "created_at": "not-a-timestamp",
    }


def build_order(
    *,
    order_id: str = "ORD-42",
    patient_id: str = "PAT-7",
    specimen_id: str = "SPC-99",
    status: OrderStatus = OrderStatus.IN_PROGRESS,
    created_at: datetime = datetime(2026, 8, 21, 8, tzinfo=UTC),
) -> LabOrder:
    return LabOrder(
        id=order_id,
        patient_id=patient_id,
        specimen_id=specimen_id,
        status=status,
        created_at=created_at,
    )
