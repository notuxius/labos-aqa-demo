import json

import httpx

from tests.support.factories.orders import build_order_payload


class OrderApiStub:
    """Stateful in-memory HTTP double for the representative orders API."""

    ORDERS_PATH = "/api/v1/orders"

    def __init__(self) -> None:
        self.created_orders: dict[str, dict[str, object]] = {}
        self.requested_order_ids: list[str] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == self.ORDERS_PATH:
            return self._create(request)

        if request.method == "GET" and request.url.path.startswith(
            f"{self.ORDERS_PATH}/"
        ):
            return self._get(request.url.path.removeprefix(f"{self.ORDERS_PATH}/"))

        return httpx.Response(405, json={"detail": "method not allowed"})

    def _create(self, request: httpx.Request) -> httpx.Response:
        submitted = json.loads(request.content)
        order: dict[str, object] = dict(
            build_order_payload(
                patient_id=submitted["patient_id"],
                specimen_id=submitted["specimen_id"],
            )
        )
        order_id = str(order["id"])
        self.created_orders[order_id] = order
        return httpx.Response(201, json=order)

    def _get(self, order_id: str) -> httpx.Response:
        self.requested_order_ids.append(order_id)
        order = self.created_orders.get(order_id)
        if order is None:
            return httpx.Response(404, json={"detail": "order not found"})
        return httpx.Response(200, json=order)
