import httpx
import pytest

from labos_demo.api import LabOsApiClient, LabOsApiError

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_http_failure_exposes_status_and_operation() -> None:
    transport = httpx.MockTransport(
        lambda _: httpx.Response(503, json={"detail": "unavailable"})
    )

    with LabOsApiClient(
        "https://example.test",
        transport=transport,
    ) as client, pytest.raises(
        LabOsApiError,
        match=r"503 for GET /api/v1/orders/ORD-42",
    ):
        client.orders.get("ORD-42")


def test_transport_timeout_is_normalized_to_client_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("upstream timed out", request=request)

    with LabOsApiClient(
        "https://example.test",
        transport=httpx.MockTransport(handler),
    ) as client, pytest.raises(LabOsApiError, match="ReadTimeout"):
        client.orders.get("ORD-42")
