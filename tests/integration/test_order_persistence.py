import pytest

from labos_demo.db import OrderRepository
from tests.factories.orders import build_identifier, build_order

pytestmark = pytest.mark.integration
def test_order_round_trips_through_sql_storage(
    repository: OrderRepository,
) -> None:
    order = build_order()

    repository.save(order)

    assert repository.get(order.id) == order


def test_missing_order_returns_none(repository: OrderRepository) -> None:
    assert repository.get(build_identifier("ORD")) is None
