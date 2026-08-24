from collections.abc import Generator

import pytest

from labos_demo.api import LabOsApiClient
from labos_demo.config import Settings, get_settings


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--live",
        action="store_true",
        default=False,
        help="Run tests that call the public LabOS website.",
    )


def pytest_collection_modifyitems(
    config: pytest.Config,
    items: list[pytest.Item],
) -> None:
    if config.getoption("--live"):
        return

    skip_live = pytest.mark.skip(
        reason="requires --live and external network access"
    )

    for item in items:
        if "live" in item.keywords:
            item.add_marker(skip_live)


@pytest.fixture(scope="session")
def settings() -> Settings:
    return get_settings()


@pytest.fixture
def live_api_client(settings: Settings) -> Generator[LabOsApiClient, None, None]:
    token = settings.api_token.get_secret_value() if settings.api_token else None
    with LabOsApiClient(
        str(settings.base_url),
        timeout_seconds=settings.timeout_seconds,
        api_token=token,
        verify_ssl=settings.verify_ssl,
    ) as client:
        yield client
