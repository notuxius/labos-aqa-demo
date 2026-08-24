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

The public website and private API use separate clients and configuration. They share only the generic HTTP transport, preventing a public-site URL from being reused accidentally for order-service calls.

## Design decisions

- `HttpClient` owns HTTP lifecycle, correlation IDs, timeouts, TLS, and transport diagnostics.
- `BaseApiClient` adds API authentication and maps transport failures to API errors.
- Resource classes such as `OrdersResource` own endpoint paths, expected statuses, and typed serialization. Raw transport responses remain available for negative-contract validation.
- `PublicSiteClient` owns public website checks independently from private API resources.
- API request models and service-independent domain models are kept in separate packages.
- Backend workflows depend on narrow service protocols, compose operations, and validate cross-call invariants.
- SQL repositories make API-to-storage checks explicit and independently testable.
- HTTPX `MockTransport` makes pull-request coverage deterministic and fast.
- API client factories close every generated client, SQL fixtures close connections deterministically, and fresh data builders prevent shared mutable test state.
- The backend E2E transport is stateful: create persists an order in memory and retrieve must request the generated identifier.
- Live checks require an explicit flag and never block the deterministic suite by accident.
- TypeScript Playwright owns browser journeys, page objects, traces, screenshots, videos, HTML, and JUnit output.

## Scaling the framework

Add a new backend domain by creating `domain/<domain>.py`, `api/models/<domain>.py`, `api/resources/<domain>.py`, and focused contract tests under `tests/api/`. Keep reusable builders, fixtures, service doubles, integration coverage, and E2E flows under the matching `tests/support/` area. Cross-service production behavior belongs under `workflows/`, while SQL access remains under `db/`. Keep Playwright specs flat under `tests/ui/` and place their page objects and deterministic HTML under `tests/support/pages/` and `tests/support/fixtures/`. This gives every support asset one canonical location and avoids parallel helper trees inside API and UI suites.
