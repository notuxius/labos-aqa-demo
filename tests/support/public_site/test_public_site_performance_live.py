from time import monotonic

import pytest

from labos_demo.config import Settings
from labos_demo.public_site import PublicSiteClient


@pytest.mark.live
@pytest.mark.performance
def test_public_homepage_meets_response_threshold(
    live_public_site_client: PublicSiteClient,
    settings: Settings,
) -> None:
    started_at = monotonic()

    live_public_site_client.get_homepage()

    elapsed_seconds = monotonic() - started_at
    assert elapsed_seconds < settings.performance_threshold_seconds
