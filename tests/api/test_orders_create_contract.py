import json

import httpx
import pytest

from labos_demo.api import LabOsApiClient, LabOsContractError
from labos_demo.api.models import CreateOrderRequest
from tests.api.data.order_payloads import (
    CREATE_ORDER_PAYLOAD,
    IN_PROGRESS_ORDER_PAYLOAD,
)

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_create_order_serializes_validated_request() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/api/v1/orders"
        assert json.loads(request.content) == CREATE_ORDER_PAYLOAD
        return httpx.Response(201, json=IN_PROGRESS_ORDER_PAYLOAD)

    with LabOsApiClient(
        "https://example.test",
        transport=httpx.MockTransport(handler),
    ) as client:
        order = client.orders.create(CreateOrderRequest(**CREATE_ORDER_PAYLOAD))

    assert order.id == "ORD-42"


def test_create_order_rejects_unexpected_success_status() -> None:
    transport = httpx.MockTransport(
        lambda _: httpx.Response(200, json=IN_PROGRESS_ORDER_PAYLOAD)
    )

    with LabOsApiClient(
        "https://example.test",
        transport=transport,
    ) as client, pytest.raises(LabOsContractError, match="Expected status 201"):
        client.orders.create(CreateOrderRequest(**CREATE_ORDER_PAYLOAD))
