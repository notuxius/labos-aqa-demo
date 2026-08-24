from pydantic import BaseModel, ConfigDict, Field


class CreateOrderRequest(BaseModel):
    """Validated payload for creating a representative LIS order."""

    model_config = ConfigDict(extra="forbid")

    patient_id: str = Field(min_length=1)
    specimen_id: str = Field(min_length=1)
