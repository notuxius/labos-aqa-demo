from datetime import datetime

import httpx
import pytest

from labos_demo.api import LabOsApiClient, LabOsContractError
from labos_demo.api.models import OrderStatus
from tests.api.data.order_payloads import (
    IN_PROGRESS_ORDER_PAYLOAD,
    MALFORMED_ORDER_PAYLOAD,
)

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_get_order_parses_typed_domain_model() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        assert request.url.path == "/api/v1/orders/ORD-42"
        return httpx.Response(200, json=IN_PROGRESS_ORDER_PAYLOAD)

    with LabOsApiClient(
        "https://example.test",
        transport=httpx.MockTransport(handler),
    ) as client:
        order = client.orders.get("ORD-42")

    assert order.id == "ORD-42"
    assert order.status is OrderStatus.IN_PROGRESS
    assert order.created_at == datetime.fromisoformat(
        "2026-08-21T08:00:00+00:00"
    )


def test_get_order_rejects_malformed_response_contract() -> None:
    transport = httpx.MockTransport(
        lambda _: httpx.Response(200, json=MALFORMED_ORDER_PAYLOAD)
    )

    with LabOsApiClient(
        "https://example.test",
        transport=transport,
    ) as client, pytest.raises(LabOsContractError, match="LabOrder contract"):
        client.orders.get("ORD-42")
