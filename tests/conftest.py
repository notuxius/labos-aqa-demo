import pytest

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
