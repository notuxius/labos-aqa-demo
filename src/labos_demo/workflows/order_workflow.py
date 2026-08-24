from typing import Protocol

from labos_demo.api import LabOsContractError
from labos_demo.api.models import CreateOrderRequest
from labos_demo.domain import LabOrder


class OrdersService(Protocol):
    """Operations required by the order business workflow."""

    def create(self, payload: CreateOrderRequest) -> LabOrder: ...

    def get(self, order_id: str) -> LabOrder: ...


class OrderWorkflow:
    """Compose API operations into a critical laboratory business flow."""

    def __init__(self, orders: OrdersService) -> None:
        self._orders = orders

    def create_and_retrieve(self, payload: CreateOrderRequest) -> LabOrder:
        created = self._orders.create(payload)
        retrieved = self._orders.get(created.id)

        if (
            retrieved.patient_id != payload.patient_id
            or retrieved.specimen_id != payload.specimen_id
        ):
            raise LabOsContractError(
                "Retrieved order does not preserve the submitted patient/specimen data"
            )
        return retrieved
