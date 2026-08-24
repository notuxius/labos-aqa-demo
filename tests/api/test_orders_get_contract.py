from datetime import datetime

import httpx
import pytest

from labos_demo.api import LabOsContractError
from labos_demo.domain import OrderStatus
from tests.factories.orders import (
    build_malformed_order_payload,
    build_order_payload,
)
from tests.support.api import ApiClientFactory

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_get_order_parses_typed_domain_model(
    api_client_factory: ApiClientFactory,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        assert request.url.path == "/api/v1/orders/ORD-42"
        return httpx.Response(200, json=build_order_payload())

    client = api_client_factory(handler)
    order = client.orders.get("ORD-42")

    assert order.id == "ORD-42"
    assert order.status is OrderStatus.IN_PROGRESS
    assert order.created_at == datetime.fromisoformat(
        "2026-08-21T08:00:00+00:00"
    )


def test_get_order_rejects_malformed_response_contract(
    api_client_factory: ApiClientFactory,
) -> None:
    client = api_client_factory(
        lambda _: httpx.Response(200, json=build_malformed_order_payload())
    )

    with pytest.raises(LabOsContractError, match="LabOrder contract"):
        client.orders.get("ORD-42")
