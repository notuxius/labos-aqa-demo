from collections.abc import Generator
from contextlib import ExitStack

import httpx
import pytest

from labos_demo.api import LabOsApiClient
from tests.support.api import ApiClientFactory, RequestHandler


@pytest.fixture
def api_client_factory() -> Generator[ApiClientFactory, None, None]:
    """Build mock API clients and close every instance after each test."""
    with ExitStack() as clients:

        def create_client(
            handler: RequestHandler,
            *,
            api_token: str | None = None,
        ) -> LabOsApiClient:
            return clients.enter_context(
                LabOsApiClient(
                    "https://api.example.test",
                    api_token=api_token,
                    transport=httpx.MockTransport(handler),
                )
            )

        yield create_client
