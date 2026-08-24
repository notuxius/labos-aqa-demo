# LabOS Quality Engineering Portfolio

[![tests](https://github.com/notuxius/labos-aqa-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/notuxius/labos-aqa-demo/actions/workflows/tests.yml)

A backend-focused automation portfolio for a representative laboratory information system. It demonstrates Python/pytest API automation, service workflows, SQL validation, TypeScript Playwright, CI/CD, diagnostics, reporting, Docker, and performance testing.

The private LabOS API is not available, so API behavior is modeled behind deterministic HTTPX transports. Public-site checks are isolated and opt-in. This keeps the project credible: it demonstrates framework design without inventing knowledge of production internals.

## Vacancy alignment

- **Backend and REST:** shared HTTPX transport, isolated service clients, resource objects, positive/negative contracts, authentication, timeout, 5xx, and malformed-response coverage.
- **Integrations and data flows:** stateful create-to-retrieve workflow plus SQL persistence validation.
- **Python and pytest:** strict typing across source and tests, centralized support fixtures, fresh data factories, parallel-ready deterministic tests, Ruff, and mypy.
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
├── api/                         # flat private-API contract suite
├── performance/                 # k6 backend performance smoke
├── ui/                          # flat deterministic and live Playwright specs
└── support/                     # centralized test infrastructure and focused suites
    ├── business_flows/          # stateful backend business journeys
    ├── factories/               # generated builders and factory contracts
    ├── fixtures/                # deterministic browser HTML
    ├── integration/             # SQL fixtures and data-flow coverage
    ├── pages/                   # Playwright page objects
    ├── public_site/             # public HTTP support, contract, and live smoke
    └── stubs/                   # stateful service doubles
```

`tests/api` and `tests/ui` contain executable top-level tests only. Shared helpers,
fixtures, page objects, and specialized backend suites have one canonical home under
`tests/support`; no parallel `fixtures`, `pages`, or `support` trees are maintained per suite.

The deterministic Python suite currently contains eight API contracts, two public-site client contracts, two SQL integration checks, six test-data factory contracts, and one stateful backend E2E flow. Browser coverage stays deliberately small and customer-focused.

Factories generate UUID-based order, patient, specimen, and upstream request identifiers; randomized timezone-aware UTC timestamps; synthetic bearer tokens; and arbitrary response bodies. The datetime factory defaults to the previous 30 days and accepts explicit inclusive `earliest` and `latest` boundaries for past, future, and boundary scenarios. Tests derive request paths and expectations from generated objects, while explicit overrides remain available for targeted boundary and invalid-data scenarios.

Protocol constants stay deterministic. Endpoint paths, HTTP statuses, expected product text, performance thresholds, and intentionally malformed values describe behavior rather than test records, so randomizing them would reduce clarity and reproducibility.

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

Requirements: Python 3.12+, [uv](https://docs.astral.sh/uv/), and Node.js 24.x. The locked quality toolchain uses pytest 9.x, mypy 2.x, TypeScript 7.x, and Playwright 1.62.x.

```bash
uv sync
npm ci
npx playwright install chromium
```

Docker is a supported alternative for the TypeScript suite. When `npm`/`npx` are not
available, Make targets automatically build and use the Playwright Compose service;
`make ui-headed` uses its virtual display. If neither Node.js nor Docker is available,
the Makefile reports the missing runtime explicitly.

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

Or use `make verify`, `make backend`, `make api`, `make public-site`, `make ui`, `make live`, and the performance targets described below.

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

The k6 [order smoke](tests/performance/orders-smoke.js) targets the representative endpoint `GET /api/v1/orders/{id}`. This repository does not provide a deployed order service, and the public `labos.co` website does not expose that endpoint. Replace the example values below with a real, reachable staging API and a synthetic order.

Run only against an approved test environment:

```dotenv
# .env (ignored by Git)
LABOS_API_BASE_URL=https://your-staging-api.example
LABOS_ORDER_ID=replace-with-synthetic-order-id
# LABOS_API_TOKEN=secret
```

```bash
make performance-k6
```

The Make target passes `.env` to a profile-gated Compose service; exported shell values take precedence. Use another file with `K6_ENV_FILE=.env.staging make performance-k6`. Optional load controls can be supplied as `VUS=10 DURATION=60s ITERATION_PAUSE_SECONDS=0.2 make performance-k6`. The default 0.1-second iteration pause prevents this smoke profile from becoming an accidental maximum-throughput test; set it to `0` only when that behavior is intentional. The profile enforces an error rate below 1% and p95 latency below 500 ms; real thresholds must come from product SLOs and production-like capacity.

Each k6 run writes a standalone dashboard to `reports/k6/orders-smoke-report.html` and an aggregated machine-readable summary to `reports/k6/orders-smoke-summary.json`. The files are overwritten by the next run, remain ignored by Git, and match the existing CI artifact collection under `reports/`.

Available Make targets:

- `make performance-public` runs the opt-in public-site response-threshold check.
- `make performance-k6` validates the required API URL and order ID before starting the k6 order smoke.
- `make performance` preflights k6 first, then runs every registered performance suite. Missing configuration stops the aggregate before any suite runs, avoiding a partial pass followed by a setup failure.

Performance checks intentionally stay outside `make verify` because they require external approved environments. Add future performance targets as prerequisites of the aggregate `performance` target in the [Makefile](Makefile).

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
