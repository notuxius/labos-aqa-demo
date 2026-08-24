import httpx
import pytest

from labos_demo.api import LabOsApiError
from tests.support.api import ApiClientFactory

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_http_failure_exposes_status_and_operation(
    api_client_factory: ApiClientFactory,
) -> None:
    client = api_client_factory(
        lambda _: httpx.Response(503, json={"detail": "unavailable"})
    )

    with pytest.raises(
        LabOsApiError,
        match=r"503 for GET /api/v1/orders/ORD-42",
    ):
        client.orders.get("ORD-42")


def test_transport_timeout_is_normalized_to_client_error(
    api_client_factory: ApiClientFactory,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("upstream timed out", request=request)

    client = api_client_factory(handler)
    with pytest.raises(LabOsApiError, match="ReadTimeout"):
        client.orders.get("ORD-42")


def test_transport_returns_error_response_for_negative_contract_checks(
    api_client_factory: ApiClientFactory,
) -> None:
    client = api_client_factory(
        lambda _: httpx.Response(404, json={"detail": "order not found"})
    )

    response = client.request("GET", "/api/v1/orders/ORD-404")

    assert response.status_code == 404
    assert response.json() == {"detail": "order not found"}
