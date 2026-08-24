import pytest

from labos_demo.db import OrderRepository
from labos_demo.domain import OrderStatus
from tests.support.factories.orders import build_identifier, build_order

pytestmark = pytest.mark.integration


def test_order_round_trips_through_sql_storage(
    repository: OrderRepository,
) -> None:
    order = build_order()

    repository.save(order)

    assert repository.get(order.id) == order


def test_missing_order_returns_none(repository: OrderRepository) -> None:
    assert repository.get(build_identifier("ORD")) is None


def test_saving_existing_order_updates_persisted_state(
    repository: OrderRepository,
) -> None:
    order = build_order(status=OrderStatus.RECEIVED)
    completed_order = order.model_copy(update={"status": OrderStatus.COMPLETED})

    repository.save(order)
    repository.save(completed_order)

    assert repository.get(order.id) == completed_order
