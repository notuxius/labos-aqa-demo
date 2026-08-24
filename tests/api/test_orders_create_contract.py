import json

import httpx
import pytest

from labos_demo.api import LabOsContractError
from labos_demo.api.models import CreateOrderRequest
from tests.factories.orders import (
    build_create_order_payload,
    build_order_payload,
)
from tests.support.api import ApiClientFactory

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_create_order_serializes_validated_request(
    api_client_factory: ApiClientFactory,
) -> None:
    request_payload = build_create_order_payload()
    response_payload = build_order_payload()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/api/v1/orders"
        assert json.loads(request.content) == request_payload
        return httpx.Response(201, json=response_payload)

    client = api_client_factory(handler)
    order = client.orders.create(CreateOrderRequest(**request_payload))

    assert order.id == "ORD-42"


def test_create_order_rejects_unexpected_success_status(
    api_client_factory: ApiClientFactory,
) -> None:
    client = api_client_factory(
        lambda _: httpx.Response(200, json=build_order_payload())
    )

    with pytest.raises(LabOsContractError, match="Expected status 201"):
        client.orders.create(CreateOrderRequest(**build_create_order_payload()))
