import httpx
import pytest

from labos_demo.api import LabOsApiError
from tests.support.api import ApiClientFactory
from tests.support.factories.http_values import build_api_token
from tests.support.factories.orders import build_identifier

pytestmark = [pytest.mark.api, pytest.mark.contract, pytest.mark.security]


def test_bearer_token_is_sent_but_not_exposed_in_errors(
    api_client_factory: ApiClientFactory,
) -> None:
    api_token = build_api_token()
    order_id = build_identifier("ORD")

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["Authorization"] == f"Bearer {api_token}"
        assert request.headers["X-Correlation-ID"]
        return httpx.Response(401, json={"detail": "unauthorized"})

    client = api_client_factory(
        handler,
        api_token=api_token,
    )
    with pytest.raises(LabOsApiError) as error:
        client.orders.get(order_id)

    assert api_token not in str(error.value)
