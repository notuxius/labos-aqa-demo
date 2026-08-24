from collections.abc import Callable
from typing import Protocol

import httpx

from labos_demo.public_site import PublicSiteClient

PublicSiteHandler = Callable[[httpx.Request], httpx.Response]


class PublicSiteClientFactory(Protocol):
    def __call__(self, handler: PublicSiteHandler) -> PublicSiteClient: ...
