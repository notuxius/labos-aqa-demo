# Test Strategy

## Quality objective

Protect critical laboratory workflows, especially the association between patient, specimen, order, processing status, and published result. The portfolio currently implements the order slice and leaves the other domains as explicit next increments.

## Risk-based coverage

| Risk | Validation approach | Execution tier |
|---|---|---|
| Incorrect patient/specimen association | Typed request/response contracts, create/retrieve invariant, SQL checks | Every pull request |
| API schema or status regression | Positive, negative, malformed-payload, and unexpected-status tests | Every pull request |
| Dependency outage or timeout | Transport-failure and 5xx normalization tests | Every pull request |
| Credential leakage | Authentication/header test and secret-safe errors | Every pull request |
| Broken customer entry journey | Cross-engine/responsive mocked Playwright contract; Chromium live smoke in staging | PR / staging |
| Accessibility regression | Deterministic axe scan of the customer entry point | Every pull request |
| Latency or stability regression | k6 threshold profile against a controlled environment | Nightly / pre-release |
| Vulnerable dependency | Locked dependency audit plus weekly Dependabot updates | Every pull request / weekly |
| External integration drift | Consumer/provider contracts in PR; sandbox E2E in staging | PR / staging |

## Test levels

- **Contract:** HTTP request shape, response schema, status semantics, authentication, and failure behavior using `MockTransport`.
- **Integration:** SQL schema and persistence behavior using isolated databases; real database containers are the next environment-specific adapter.
- **Backend E2E:** stateful multi-call workflows such as create order then retrieve and compare business data.
- **UI E2E:** only critical user journeys in TypeScript Playwright; API setup should prepare data whenever a real test API exists.
- **Non-functional:** accessibility checks and validated k6 functional/latency thresholds first, then load, soak, and resilience experiments with production-like capacity.

## Execution model

| Trigger | Suite | Blocking |
|---|---|---|
| Local change | Ruff, mypy, targeted pytest/Playwright | Developer decision |
| Pull request | Static checks, deterministic API, SQL, backend E2E, mocked UI | Yes |
| Staging deploy | Live API/UI smoke and selected integration flows | Yes for promotion |
| Nightly | Full staging regression and performance smoke | Alert and triage |
| Production | Read-only synthetic smoke only | Alert; no destructive data |

## Test data and environments

- Generate unique order, patient, and specimen identifiers per run.
- Never use real patient data; synthetic data is mandatory.
- Store tokens in CI credential stores and inject them through environment variables.
- Keep test data cleanup idempotent and tag records with run/build identifiers.
- Pin dependencies and container images; promote the same test artifact between environments.

## Entry and exit criteria

Entry requires deployed services, known version, reachable dependencies, migrated schema, and test credentials. Exit requires all critical tests passing, no unresolved critical defects, reviewed flaky failures, acceptable performance thresholds, and published reports linked to the release.

## Ownership and maintenance

Test code follows the same review rules as production code. Flaky tests are quarantined only with an owner, Jira issue, evidence, and expiry date. Coverage is reviewed during refinement so acceptance criteria, observability, and testability are addressed before implementation.
