import pytest

from labos_demo.workflows import OrderWorkflow
from tests.e2e.support.order_api_stub import OrderApiStub
from tests.factories.orders import build_create_order_request

pytestmark = [pytest.mark.api, pytest.mark.e2e]


def test_create_order_then_retrieve_preserves_business_data(
    order_workflow: OrderWorkflow,
    order_api_stub: OrderApiStub,
) -> None:
    payload = build_create_order_request()

    order = order_workflow.create_and_retrieve(payload)

    assert order_api_stub.created_orders[order.id]["patient_id"] == payload.patient_id
    assert order_api_stub.requested_order_ids == [order.id]
