from collections.abc import Generator
from contextlib import ExitStack

import httpx
import pytest

from labos_demo.config import Settings
from labos_demo.public_site import PublicSiteClient
from tests.support.public_site import PublicSiteClientFactory, PublicSiteHandler


@pytest.fixture
def public_site_client_factory() -> Generator[PublicSiteClientFactory, None, None]:
    with ExitStack() as clients:

        def create_client(handler: PublicSiteHandler) -> PublicSiteClient:
            return clients.enter_context(
                PublicSiteClient(
                    "https://www.example.test",
                    transport=httpx.MockTransport(handler),
                )
            )

        yield create_client


@pytest.fixture
def live_public_site_client(
    settings: Settings,
) -> Generator[PublicSiteClient, None, None]:
    with PublicSiteClient(
        str(settings.public_site_url),
        timeout_seconds=settings.timeout_seconds,
        verify_ssl=settings.verify_ssl,
    ) as client:
        yield client
