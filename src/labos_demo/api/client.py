import httpx

from labos_demo.api.base_client import BaseApiClient
from labos_demo.api.errors import (
    LabOsApiError as LabOsApiError,
)
from labos_demo.api.errors import (
    LabOsContractError as LabOsContractError,
)
from labos_demo.api.models import CreateOrderRequest
from labos_demo.api.resources import OrdersResource
from labos_demo.domain import LabOrder

__all__ = ["LabOsApiClient", "LabOsApiError", "LabOsContractError"]


class LabOsApiClient(BaseApiClient):
    """Expose typed LabOS endpoint operations."""

    def __init__(
        self,
        base_url: str,
        *,
        timeout_seconds: float = 10.0,
        transport: httpx.BaseTransport | None = None,
        api_token: str | None = None,
        verify_ssl: bool = True,
    ) -> None:
        super().__init__(
            base_url,
            timeout_seconds=timeout_seconds,
            transport=transport,
            api_token=api_token,
            verify_ssl=verify_ssl,
        )
        self.orders = OrdersResource(self)

    def get_order(self, order_id: str) -> LabOrder:
        return self.orders.get(order_id)

    def create_order(self, payload: CreateOrderRequest) -> LabOrder:
        return self.orders.create(payload)
