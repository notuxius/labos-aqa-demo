from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class OrderStatus(StrEnum):
    RECEIVED = "received"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LabOrder(BaseModel):
    """Service-independent laboratory order representation."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    patient_id: str = Field(min_length=1)
    specimen_id: str = Field(min_length=1)
    status: OrderStatus
    created_at: datetime
