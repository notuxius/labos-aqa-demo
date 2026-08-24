import pytest

from labos_demo.public_site import PublicSiteClient


@pytest.mark.live
@pytest.mark.smoke
def test_labos_public_homepage_is_available(
    live_public_site_client: PublicSiteClient,
) -> None:
    response = live_public_site_client.get_homepage()

    assert "Laboratory Information System" in response.text
