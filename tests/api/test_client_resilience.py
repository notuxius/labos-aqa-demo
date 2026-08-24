import re

import httpx
import pytest

from labos_demo.api import LabOsApiError
from tests.factories.orders import build_identifier
from tests.support.api import ApiClientFactory

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_http_failure_exposes_status_and_operation(
    api_client_factory: ApiClientFactory,
) -> None:
    order_id = build_identifier("ORD")
    client = api_client_factory(
        lambda _: httpx.Response(503, json={"detail": "unavailable"})
    )

    with pytest.raises(
        LabOsApiError,
        match=re.escape(f"503 for GET /api/v1/orders/{order_id}"),
    ):
        client.orders.get(order_id)


def test_transport_timeout_is_normalized_to_client_error(
    api_client_factory: ApiClientFactory,
) -> None:
    order_id = build_identifier("ORD")

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("upstream timed out", request=request)

    client = api_client_factory(handler)
    with pytest.raises(LabOsApiError, match="ReadTimeout"):
        client.orders.get(order_id)


def test_transport_returns_error_response_for_negative_contract_checks(
    api_client_factory: ApiClientFactory,
) -> None:
    missing_order_id = build_identifier("ORD")
    client = api_client_factory(
        lambda _: httpx.Response(404, json={"detail": "order not found"})
    )

    response = client.request("GET", f"/api/v1/orders/{missing_order_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "order not found"}
