import logging
from types import TracebackType
from typing import Self
from uuid import uuid4

import httpx

from labos_demo.http.errors import HttpTransportError

LOGGER = logging.getLogger(__name__)


class HttpClient:
    """Own synchronous HTTP lifecycle and normalize transport failures."""

    def __init__(
        self,
        base_url: str,
        *,
        timeout_seconds: float = 10.0,
        transport: httpx.BaseTransport | None = None,
        headers: dict[str, str] | None = None,
        verify_ssl: bool = True,
    ) -> None:
        self._client = httpx.Client(
            base_url=base_url,
            timeout=timeout_seconds,
            transport=transport,
            follow_redirects=True,
            headers=headers,
            verify=verify_ssl,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()

    def request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, object] | None = None,
    ) -> httpx.Response:
        correlation_id = str(uuid4())
        try:
            response = self._client.request(
                method,
                path,
                json=json,
                headers={"X-Correlation-ID": correlation_id},
            )
        except httpx.RequestError as exc:
            LOGGER.warning(
                "HTTP transport failure method=%s path=%s error=%s request_id=%s",
                method,
                path,
                type(exc).__name__,
                correlation_id,
            )
            raise HttpTransportError(
                f"Request failed for {method} {path}: "
                f"{type(exc).__name__} (request_id={correlation_id})"
            ) from exc

        LOGGER.info(
            "HTTP request method=%s path=%s status=%s request_id=%s",
            method,
            path,
            response.status_code,
            response.headers.get("X-Request-ID", correlation_id),
        )
        return response
