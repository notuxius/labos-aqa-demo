from datetime import datetime

import httpx
import pytest

from labos_demo.api import LabOsContractError
from labos_demo.domain import OrderStatus
from tests.support.api import ApiClientFactory
from tests.support.factories.orders import (
    build_identifier,
    build_malformed_order_payload,
    build_order_payload,
)

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_get_order_parses_typed_domain_model(
    api_client_factory: ApiClientFactory,
) -> None:
    response_payload = build_order_payload()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        assert request.url.path == f"/api/v1/orders/{response_payload['id']}"
        return httpx.Response(200, json=response_payload)

    client = api_client_factory(handler)
    order = client.orders.get(response_payload["id"])

    assert order.id == response_payload["id"]
    assert order.status is OrderStatus.IN_PROGRESS
    assert order.created_at == datetime.fromisoformat(response_payload["created_at"])


def test_get_order_rejects_malformed_response_contract(
    api_client_factory: ApiClientFactory,
) -> None:
    order_id = build_identifier("ORD")
    client = api_client_factory(
        lambda _: httpx.Response(200, json=build_malformed_order_payload())
    )

    with pytest.raises(LabOsContractError, match="LabOrder contract"):
        client.orders.get(order_id)


def test_get_order_rejects_invalid_json_response(
    api_client_factory: ApiClientFactory,
) -> None:
    order_id = build_identifier("ORD")
    client = api_client_factory(
        lambda _: httpx.Response(
            200,
            content=b"{not-json",
            headers={"Content-Type": "application/json"},
        )
    )

    with pytest.raises(LabOsContractError, match="not valid JSON"):
        client.orders.get(order_id)
