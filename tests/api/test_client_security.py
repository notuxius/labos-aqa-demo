import httpx
import pytest

from labos_demo.api import LabOsApiClient, LabOsApiError

pytestmark = [pytest.mark.api, pytest.mark.contract, pytest.mark.security]


def test_bearer_token_is_sent_but_not_exposed_in_errors() -> None:
    api_token = "super-secret-test-token"

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["Authorization"] == f"Bearer {api_token}"
        assert request.headers["X-Correlation-ID"]
        return httpx.Response(401, json={"detail": "unauthorized"})

    with LabOsApiClient(
        "https://example.test",
        api_token=api_token,
        transport=httpx.MockTransport(handler),
    ) as client, pytest.raises(LabOsApiError) as error:
        client.orders.get("ORD-42")

    assert api_token not in str(error.value)
