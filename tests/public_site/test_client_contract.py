import httpx
import pytest

from labos_demo.public_site import PublicSiteError
from tests.support.public_site import PublicSiteClientFactory

pytestmark = pytest.mark.contract


def test_homepage_requests_public_root(
    public_site_client_factory: PublicSiteClientFactory,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        assert request.url.path == "/"
        return httpx.Response(200, text="LabOS")

    client = public_site_client_factory(handler)

    assert client.get_homepage().text == "LabOS"


def test_homepage_rejects_unavailable_public_site(
    public_site_client_factory: PublicSiteClientFactory,
) -> None:
    client = public_site_client_factory(lambda _: httpx.Response(503))

    with pytest.raises(PublicSiteError, match="Expected status 200"):
        client.get_homepage()
