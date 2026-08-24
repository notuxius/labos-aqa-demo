import pytest

from labos_demo.api import LabOsContractError
from labos_demo.api.models import CreateOrderRequest
from labos_demo.domain import LabOrder
from labos_demo.workflows import OrderWorkflow
from tests.support.factories.orders import (
    build_create_order_request,
    build_identifier,
    build_order,
)
from tests.support.stubs.order_api_stub import OrderApiStub

pytestmark = [pytest.mark.api, pytest.mark.e2e]


class MismatchedOrdersService:
    def __init__(self, created: LabOrder, retrieved: LabOrder) -> None:
        self._created = created
        self._retrieved = retrieved

    def create(self, payload: CreateOrderRequest) -> LabOrder:
        return self._created

    def get(self, order_id: str) -> LabOrder:
        return self._retrieved


def test_create_order_then_retrieve_preserves_business_data(
    order_workflow: OrderWorkflow,
    order_api_stub: OrderApiStub,
) -> None:
    payload = build_create_order_request()

    order = order_workflow.create_and_retrieve(payload)

    assert order_api_stub.created_orders[order.id]["patient_id"] == payload.patient_id
    assert order_api_stub.requested_order_ids == [order.id]


def test_create_and_retrieve_rejects_changed_business_association() -> None:
    payload = build_create_order_request()
    created = build_order(
        patient_id=payload.patient_id,
        specimen_id=payload.specimen_id,
    )
    retrieved = created.model_copy(
        update={"patient_id": build_identifier("PAT")}
    )
    workflow = OrderWorkflow(MismatchedOrdersService(created, retrieved))

    with pytest.raises(LabOsContractError, match="patient/specimen"):
        workflow.create_and_retrieve(payload)
