from time import monotonic

import pytest

from labos_demo.api import LabOsApiClient
from labos_demo.config import Settings


@pytest.mark.api
@pytest.mark.live
@pytest.mark.performance
def test_public_homepage_meets_response_threshold(
    live_api_client: LabOsApiClient,
    settings: Settings,
) -> None:
    started_at = monotonic()

    live_api_client.get_public_homepage()

    elapsed_seconds = monotonic() - started_at
    assert elapsed_seconds < settings.performance_threshold_seconds
