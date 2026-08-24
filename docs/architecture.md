# Automation Architecture

## Goal

Demonstrate a maintainable, backend-focused automation approach for a representative laboratory information system without claiming knowledge of private LabOS APIs.

## System and test boundaries

```text
Customer browser
      |
      v
Public web UI -------- TypeScript Playwright contract/live tests
      |
      v
REST API ------------- Python + pytest + HTTPX contract tests
      |
      v
Order workflow ------- Stateful create -> retrieve business-flow test
      |
      v
SQL persistence ------ Repository integration tests with SQLite

External integrations - Explicit extension point; use contract doubles in PRs
                        and provider sandboxes in staging
```

## Design decisions

- `BaseApiClient` owns HTTP lifecycle, timeouts, TLS, authentication, and normalized failures.
- Resource classes such as `OrdersResource` own endpoint paths and typed serialization.
- Pydantic models reject invalid data at the service boundary.
- Backend workflows compose resource operations and validate cross-call invariants.
- SQL repositories make API-to-storage checks explicit and independently testable.
- HTTPX `MockTransport` makes pull-request coverage deterministic and fast.
- Live checks require an explicit flag and never block the deterministic suite by accident.
- TypeScript Playwright owns browser journeys, page objects, traces, screenshots, videos, HTML, and JUnit output.

## Scaling the framework

Add a new backend domain by creating `models/<domain>.py`, `resources/<domain>.py`, and focused contract tests. Add cross-service behavior under `workflows/`; keep SQL validation under `db/` and `tests/integration/`. This avoids one oversized client or test module and permits parallel ownership by multiple teams.
