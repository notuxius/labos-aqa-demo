import httpx

from labos_demo.api.errors import LabOsApiError
from labos_demo.http import HttpClient, HttpTransportError


class BaseApiClient(HttpClient):
    """Configure the shared transport for authenticated LabOS API calls."""

    def __init__(
        self,
        base_url: str,
        *,
        timeout_seconds: float = 10.0,
        transport: httpx.BaseTransport | None = None,
        api_token: str | None = None,
        verify_ssl: bool = True,
    ) -> None:
        headers = {
            "Accept": "application/json",
            "User-Agent": "labos-aqa-demo/0.1",
        }
        if api_token:
            headers["Authorization"] = f"Bearer {api_token}"

        super().__init__(
            base_url,
            timeout_seconds=timeout_seconds,
            transport=transport,
            headers=headers,
            verify_ssl=verify_ssl,
        )

    def request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, object] | None = None,
    ) -> httpx.Response:
        try:
            return super().request(method, path, json=json)
        except HttpTransportError as exc:
            raise LabOsApiError(f"LabOS API {exc}") from exc
