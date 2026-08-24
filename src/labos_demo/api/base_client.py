import logging
from types import TracebackType
from typing import Self
from uuid import uuid4

import httpx

from labos_demo.api.errors import LabOsApiError, LabOsContractError

LOGGER = logging.getLogger(__name__)


class BaseApiClient:
    """Own HTTP transport, lifecycle, and shared error handling."""

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
        expected_status: int,
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
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            response_id = exc.response.headers.get(
                "X-Request-ID",
                correlation_id,
            )
            LOGGER.warning(
                "API status failure method=%s path=%s status=%s request_id=%s",
                method,
                path,
                exc.response.status_code,
                response_id,
            )
            raise LabOsApiError(
                f"LabOS API returned {exc.response.status_code} "
                f"for {method} {path} (request_id={response_id})"
            ) from exc
        except httpx.RequestError as exc:
            LOGGER.warning(
                "API transport failure method=%s path=%s error=%s request_id=%s",
                method,
                path,
                type(exc).__name__,
                correlation_id,
            )
            raise LabOsApiError(
                f"LabOS request failed for {method} {path}: "
                f"{type(exc).__name__} (request_id={correlation_id})"
            ) from exc

        if response.status_code != expected_status:
            raise LabOsContractError(
                f"Expected status {expected_status} for {method} {path}, "
                f"got {response.status_code}"
            )
        LOGGER.info(
            "API request method=%s path=%s status=%s request_id=%s",
            method,
            path,
            response.status_code,
            response.headers.get("X-Request-ID", correlation_id),
        )
        return response
