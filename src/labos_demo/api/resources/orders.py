import httpx
from pydantic import ValidationError

from labos_demo.api.base_client import BaseApiClient
from labos_demo.api.errors import LabOsApiError, LabOsContractError
from labos_demo.api.models import CreateOrderRequest
from labos_demo.domain import LabOrder


class OrdersResource:
    """Typed operations for the representative LIS orders endpoint."""

    PATH = "/api/v1/orders"

    def __init__(self, client: BaseApiClient) -> None:
        self._client = client

    def get(self, order_id: str) -> LabOrder:
        response = self._client.request(
            "GET",
            f"{self.PATH}/{order_id}",
        )
        self._require_status(response, expected_status=200)
        return self._parse_order(response)

    def create(self, payload: CreateOrderRequest) -> LabOrder:
        response = self._client.request(
            "POST",
            self.PATH,
            json=payload.model_dump(mode="json"),
        )
        self._require_status(response, expected_status=201)
        return self._parse_order(response)

    @staticmethod
    def _require_status(response: httpx.Response, *, expected_status: int) -> None:
        if response.status_code == expected_status:
            return

        if response.is_error:
            request_id = response.headers.get("X-Request-ID", "not-provided")
            raise LabOsApiError(
                f"LabOS API returned {response.status_code} for "
                f"{response.request.method} {response.request.url.path} "
                f"(request_id={request_id})"
            )
        raise LabOsContractError(
            f"Expected status {expected_status} for "
            f"{response.request.method} {response.request.url.path}, "
            f"got {response.status_code}"
        )

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
