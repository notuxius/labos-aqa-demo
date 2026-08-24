IN_PROGRESS_ORDER_PAYLOAD = {
    "id": "ORD-42",
    "patient_id": "PAT-7",
    "specimen_id": "SPC-99",
    "status": "in_progress",
    "created_at": "2026-08-21T08:00:00Z",
}

CREATE_ORDER_PAYLOAD = {
    "patient_id": "PAT-7",
    "specimen_id": "SPC-99",
}

MALFORMED_ORDER_PAYLOAD = {
    "id": "ORD-42",
    "patient_id": "PAT-7",
    "specimen_id": "SPC-99",
    "status": "unknown",
    "created_at": "not-a-timestamp",
}
