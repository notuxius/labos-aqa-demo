import httpx

from labos_demo.http import HttpClient, HttpTransportError
from labos_demo.public_site.errors import PublicSiteError


class PublicSiteClient(HttpClient):
    """Expose public-site checks independently from private API services."""

    def __init__(
        self,
        base_url: str,
        *,
        timeout_seconds: float = 10.0,
        transport: httpx.BaseTransport | None = None,
        verify_ssl: bool = True,
    ) -> None:
        super().__init__(
            base_url,
            timeout_seconds=timeout_seconds,
            transport=transport,
            headers={
                "Accept": "text/html,application/xhtml+xml",
                "User-Agent": "labos-aqa-demo/0.1",
            },
            verify_ssl=verify_ssl,
        )

    def get_homepage(self) -> httpx.Response:
        try:
            response = self.request("GET", "/")
        except HttpTransportError as exc:
            raise PublicSiteError(f"Public site {exc}") from exc

        if response.status_code != 200:
            raise PublicSiteError(
                f"Expected status 200 for GET /, got {response.status_code}"
            )
        return response
