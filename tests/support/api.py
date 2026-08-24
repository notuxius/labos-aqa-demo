from collections.abc import Callable
from typing import Protocol

import httpx

from labos_demo.api import LabOsApiClient

RequestHandler = Callable[[httpx.Request], httpx.Response]


class ApiClientFactory(Protocol):
    def __call__(
        self,
        handler: RequestHandler,
        *,
        api_token: str | None = None,
    ) -> LabOsApiClient: ...
