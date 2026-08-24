import sqlite3
from datetime import UTC, datetime

import pytest

from labos_demo.api.models import LabOrder, OrderStatus
from labos_demo.db import OrderRepository

pytestmark = pytest.mark.integration


@pytest.fixture
def repository() -> OrderRepository:
    connection = sqlite3.connect(":memory:")
    repository = OrderRepository(connection)
    repository.create_schema()
    return repository


def test_order_round_trips_through_sql_storage(
    repository: OrderRepository,
) -> None:
    order = LabOrder(
        id="ORD-42",
        patient_id="PAT-7",
        specimen_id="SPC-99",
        status=OrderStatus.IN_PROGRESS,
        created_at=datetime(2026, 8, 21, 8, tzinfo=UTC),
    )

    repository.save(order)

    assert repository.get(order.id) == order


def test_missing_order_returns_none(repository: OrderRepository) -> None:
    assert repository.get("ORD-404") is None
