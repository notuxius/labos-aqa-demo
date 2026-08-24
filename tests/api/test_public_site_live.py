import pytest

from labos_demo.api import LabOsApiClient


@pytest.mark.api
@pytest.mark.live
@pytest.mark.smoke
def test_labos_public_homepage_is_available(
    live_api_client: LabOsApiClient,
) -> None:
    response = live_api_client.get_public_homepage()

    assert response.status_code == 200
    assert "Laboratory Information System" in response.text
