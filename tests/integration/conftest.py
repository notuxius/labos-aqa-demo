import sqlite3
from collections.abc import Generator

import pytest

from labos_demo.db import OrderRepository


@pytest.fixture
def sqlite_connection() -> Generator[sqlite3.Connection, None, None]:
    connection = sqlite3.connect(":memory:")
    try:
        yield connection
    finally:
        connection.close()


@pytest.fixture
def repository(sqlite_connection: sqlite3.Connection) -> OrderRepository:
    repository = OrderRepository(sqlite_connection)
    repository.create_schema()
    return repository
