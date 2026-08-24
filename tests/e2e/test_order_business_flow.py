import json

import httpx
import pytest

from labos_demo.api import LabOsApiClient
from labos_demo.api.models import CreateOrderRequest
from labos_demo.workflows import OrderWorkflow
from tests.api.data.order_payloads import IN_PROGRESS_ORDER_PAYLOAD

pytestmark = [pytest.mark.api, pytest.mark.e2e]


def test_create_order_then_retrieve_preserves_business_data() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            submitted = json.loads(request.content)
            return httpx.Response(
                201,
                json={**IN_PROGRESS_ORDER_PAYLOAD, **submitted},
            )
        if request.method == "GET":
            return httpx.Response(200, json=IN_PROGRESS_ORDER_PAYLOAD)
        return httpx.Response(405)

    payload = CreateOrderRequest(patient_id="PAT-7", specimen_id="SPC-99")
    with LabOsApiClient(
        "https://example.test",
        transport=httpx.MockTransport(handler),
    ) as client:
        order = OrderWorkflow(client).create_and_retrieve(payload)

    assert order.id == "ORD-42"
