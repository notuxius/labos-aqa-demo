# LabOS Quality Engineering Portfolio

[![tests](https://github.com/notuxius/labos-aqa-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/notuxius/labos-aqa-demo/actions/workflows/tests.yml)

A backend-focused automation portfolio for a representative laboratory information system. It demonstrates Python/pytest API automation, service workflows, SQL validation, TypeScript Playwright, CI/CD, diagnostics, reporting, Docker, and performance testing.

The private LabOS API is not available, so API behavior is modeled behind deterministic HTTPX transports. Public-site checks are isolated and opt-in. This keeps the project credible: it demonstrates framework design without inventing knowledge of production internals.

## Vacancy alignment

- **Backend and REST:** shared HTTPX transport, isolated service clients, resource objects, positive/negative contracts, authentication, timeout, 5xx, and malformed-response coverage.
- **Integrations and data flows:** stateful create-to-retrieve workflow plus SQL persistence validation.
- **Python and pytest:** strict typing across source and tests, suite-owned fixtures, fresh data factories, parallel-ready deterministic tests, Ruff, and mypy.
- **TypeScript Playwright:** page object, mocked contract, optional live journey, retries, traces, screenshots, videos, HTML, and JUnit reports.
- **CI/CD and containers:** Jenkins parallel stages, GitHub Actions, separate Docker targets, and Compose.
- **Performance/resilience:** HTTP transport failure tests, configurable live threshold, and a k6 smoke profile.
- **Test leadership:** architecture, risk-based strategy, release test plan, Agile workflow, traceability, and failure runbook.

See [requirements traceability](docs/requirements-traceability.md) for the full mapping and explicit limitations.

## Architecture

```text
src/labos_demo/
├── http/
│   ├── client.py            # shared HTTP lifecycle and diagnostics
│   └── errors.py            # transport-level failure
├── domain/order.py          # service-independent order model
├── api/
│   ├── base_client.py       # API auth and transport-error mapping
│   ├── client.py            # private API facade
│   ├── errors.py
│   ├── models/order.py      # typed request contract
│   └── resources/orders.py  # status semantics and response parsing
├── public_site/client.py    # isolated public website boundary
├── db/order_repository.py       # parameterized SQL validation
└── workflows/order_workflow.py  # protocol-driven business flow

tests/
├── factories/                   # fresh typed order builders
├── support/                     # reusable fixture interfaces
├── api/                         # API contracts, resilience, security
├── public_site/                 # public contract and opt-in live smoke
├── integration/                 # SQL fixtures and data-flow coverage
└── e2e/                         # stateful backend business journey

ui-tests/
├── pages/                       # TypeScript page objects
└── specs/                       # deterministic and live Playwright tests
```

The deterministic Python suite currently contains eight API contracts, two public-site client contracts, two SQL integration checks, one test-data factory contract, and one stateful backend E2E flow. Browser coverage stays deliberately small and customer-focused.

Order factories generate a new UUID-based order, patient, and specimen identifier plus a timezone-aware current UTC timestamp for every record. Tests derive request paths and expectations from the generated object; explicit overrides remain available for targeted boundary and invalid-data scenarios.

## Automated coverage

| Suite | Scope | Default execution |
|---|---|---|
| Python quality | Ruff and strict mypy across source, fixtures, and tests | Push / pull request |
| API contracts | Request shape, typed responses, malformed payloads, status codes, timeouts, authentication, and secret-safe errors | Push / pull request |
| SQL integration | Order persistence and missing-record behavior | Push / pull request |
| Backend E2E | Create order, retrieve it, and preserve patient/specimen associations | Push / pull request |
| Playwright contract | Mocked customer homepage entry point in Chromium | Push / pull request |
| Public-site client | Root request and unavailable-site behavior | Push / pull request |
| Public-site smoke | HTTP availability, response threshold, and live browser journey | Manual workflow only |
| k6 | Order-read error rate and p95 latency | Approved test environment only |

## Setup

Requirements: Python 3.12+, [uv](https://docs.astral.sh/uv/), and Node.js 22+.

```bash
uv sync
npm ci
npx playwright install chromium
```

Optional environment configuration:

```bash
cp .env.example .env
```

`LABOS_PUBLIC_SITE_URL` configures public HTTP and browser checks. `LABOS_API_BASE_URL` is deliberately separate and has no default; provide it only for an approved order API environment. Secrets such as `LABOS_API_TOKEN` belong in the CI secret store, not `.env` or source control.

## Run locally

Python quality and deterministic backend coverage:

```bash
uv run ruff check .
uv run mypy src tests
uv run pytest -q -m "not live"
```

TypeScript UI contract:

```bash
npm run typecheck:ui
npm run test:ui
```

Opt-in live checks:

```bash
uv run pytest -q --live -m live
npm run test:ui:live
```

Or use `make verify`, `make backend`, `make api`, `make public-site`, `make ui`, and `make live`.

## CI/CD and reports

[Jenkinsfile](Jenkinsfile) runs Python quality, backend tests, and TypeScript Playwright in isolated Docker agents. Backend and UI tests run in parallel. Jenkins publishes JUnit and archives Playwright HTML, traces, screenshots, and videos from `reports/`.

[GitHub Actions](https://github.com/notuxius/labos-aqa-demo/actions/workflows/tests.yml) provides the same deterministic gates:

- `python-quality` runs Ruff, mypy, API and public-site contracts, SQL integration tests, and backend E2E tests.
- `typescript-ui` type-checks the Playwright suite and runs the mocked Chromium contract.
- `live-api-smoke` and `live-ui-smoke` run only through **Actions → tests → Run workflow**.

The workflow uses Node.js 24-compatible GitHub Actions pinned to immutable commit SHAs. JUnit and Playwright reports are uploaded from every deterministic CI run. Live checks remain manual because external availability must not make pull requests flaky.

## Containers

```bash
docker compose build
docker compose run --rm backend-tests
docker compose run --rm ui-tests
```

The multi-stage [Dockerfile](Dockerfile) keeps Python and browser environments independent, matching how larger suites are usually scaled across CI workers.

## Performance smoke

The k6 script targets the representative endpoint `GET /api/v1/orders/{id}`. This repository does not provide a deployed order service, and the public `labos.co` website does not expose that endpoint. Replace the example values below with a real, reachable staging API and a synthetic order.

Run only against an approved test environment:

```bash
docker run --rm -i \
  -e LABOS_API_BASE_URL=https://your-staging-api.example \
  -e LABOS_ORDER_ID=replace-with-synthetic-order-id \
  -e LABOS_API_TOKEN=secret \
  -v "$PWD/performance:/scripts" \
  grafana/k6 run /scripts/orders-smoke.js
```

The profile enforces an error rate below 1% and p95 latency below 500 ms; real thresholds must come from product SLOs and production-like capacity.

## Engineering documents

- [Automation architecture](docs/architecture.md)
- [Risk-based test strategy](docs/test-strategy.md)
- [Order workflow test plan](docs/test-plan.md)
- [Failure and root-cause runbook](docs/failure-runbook.md)
- [Agile quality workflow](docs/agile-quality-workflow.md)
- [AI-assisted testing guidelines](docs/ai-assisted-testing.md)

## Next credible increment

With a real API specification and test environment, extend the order slice into:

```text
create order -> receive specimen -> process test -> publish result
             -> validate patient result -> validate audit history
```

Add real database containers and provider contract/sandbox tests only after the actual architecture, ownership boundaries, and data rules are known.
