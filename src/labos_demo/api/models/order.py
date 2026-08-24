from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class OrderStatus(StrEnum):
    RECEIVED = "received"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CreateOrderRequest(BaseModel):
    """Validated payload for creating a representative LIS order."""

    model_config = ConfigDict(extra="forbid")

    patient_id: str = Field(min_length=1)
    specimen_id: str = Field(min_length=1)


class LabOrder(BaseModel):
    """Small representative LIS domain model used by the demo client."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    patient_id: str = Field(min_length=1)
    specimen_id: str = Field(min_length=1)
    status: OrderStatus
    created_at: datetime
