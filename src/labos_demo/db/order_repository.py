import sqlite3

from labos_demo.domain import LabOrder


class OrderRepository:
    """Small SQL repository used to validate API-to-database data flows."""

    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def create_schema(self) -> None:
        self._connection.execute(
            """
            CREATE TABLE IF NOT EXISTS lab_orders (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                specimen_id TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        self._connection.commit()

    def save(self, order: LabOrder) -> None:
        self._connection.execute(
            """
            INSERT INTO lab_orders (
                id, patient_id, specimen_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                patient_id = excluded.patient_id,
                specimen_id = excluded.specimen_id,
                status = excluded.status,
                created_at = excluded.created_at
            """,
            (
                order.id,
                order.patient_id,
                order.specimen_id,
                order.status.value,
                order.created_at.isoformat(),
            ),
        )
        self._connection.commit()

    def get(self, order_id: str) -> LabOrder | None:
        row = self._connection.execute(
            """
            SELECT id, patient_id, specimen_id, status, created_at
            FROM lab_orders
            WHERE id = ?
            """,
            (order_id,),
        ).fetchone()
        if row is None:
            return None

        return LabOrder.model_validate(
            {
                "id": row[0],
                "patient_id": row[1],
                "specimen_id": row[2],
                "status": row[3],
                "created_at": row[4],
            }
        )
