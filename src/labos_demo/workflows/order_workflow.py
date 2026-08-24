from labos_demo.api import LabOsApiClient, LabOsContractError
from labos_demo.api.models import CreateOrderRequest, LabOrder


class OrderWorkflow:
    """Compose API operations into a critical laboratory business flow."""

    def __init__(self, client: LabOsApiClient) -> None:
        self._client = client

    def create_and_retrieve(self, payload: CreateOrderRequest) -> LabOrder:
        created = self._client.orders.create(payload)
        retrieved = self._client.orders.get(created.id)

        if (
            retrieved.patient_id != payload.patient_id
            or retrieved.specimen_id != payload.specimen_id
        ):
            raise LabOsContractError(
                "Retrieved order does not preserve the submitted patient/specimen data"
            )
        return retrieved
