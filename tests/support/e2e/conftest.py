from collections.abc import Generator

import httpx
import pytest

from labos_demo.api import LabOsApiClient
from labos_demo.workflows import OrderWorkflow
from tests.support.stubs.order_api_stub import OrderApiStub


@pytest.fixture
def order_api_stub() -> OrderApiStub:
    return OrderApiStub()


@pytest.fixture
def order_api_client(
    order_api_stub: OrderApiStub,
) -> Generator[LabOsApiClient, None, None]:
    with LabOsApiClient(
        "https://api.example.test",
        transport=httpx.MockTransport(order_api_stub),
    ) as client:
        yield client


@pytest.fixture
def order_workflow(order_api_client: LabOsApiClient) -> OrderWorkflow:
    return OrderWorkflow(order_api_client.orders)
