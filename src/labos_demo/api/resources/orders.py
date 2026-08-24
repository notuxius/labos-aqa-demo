import httpx
from pydantic import ValidationError

from labos_demo.api.base_client import BaseApiClient
from labos_demo.api.errors import LabOsContractError
from labos_demo.api.models import CreateOrderRequest, LabOrder


class OrdersResource:
    """Typed operations for the representative LIS orders endpoint."""

    PATH = "/api/v1/orders"

    def __init__(self, client: BaseApiClient) -> None:
        self._client = client

    def get(self, order_id: str) -> LabOrder:
        response = self._client.request(
            "GET",
            f"{self.PATH}/{order_id}",
            expected_status=200,
        )
        return self._parse_order(response)

    def create(self, payload: CreateOrderRequest) -> LabOrder:
        response = self._client.request(
            "POST",
            self.PATH,
            expected_status=201,
            json=payload.model_dump(mode="json"),
        )
        return self._parse_order(response)

    @staticmethod
    def _parse_order(response: httpx.Response) -> LabOrder:
        try:
            payload = response.json()
        except ValueError as exc:
            raise LabOsContractError(
                "Order response is not valid JSON"
            ) from exc

        try:
            return LabOrder.model_validate(payload)
        except ValidationError as exc:
            raise LabOsContractError(
                "Order response does not match the LabOrder contract"
            ) from exc
