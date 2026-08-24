# Order Workflow Test Plan

## Scope

Representative release slice: create a laboratory order, retrieve it, validate patient/specimen association, persist its state, and expose the public customer entry point.

## Scenarios

| Priority | Scenario | Expected result | Automation |
|---|---|---|---|
| P0 | Create an order with valid patient/specimen IDs | `201`; typed order returned | Implemented contract test |
| P0 | Retrieve an existing order | `200`; schema and values valid | Implemented contract test |
| P0 | Create then retrieve | Submitted associations are preserved | Implemented backend E2E |
| P0 | API returns malformed order | Contract failure identifies the boundary | Implemented negative test |
| P0 | API is unavailable or times out | Stable framework error supports triage | Implemented resilience tests |
| P0 | Unauthorized request | `401`; token is absent from errors/reports | Implemented security test |
| P1 | Persist/retrieve order in SQL | Values and types round-trip correctly | Implemented integration test |
| P1 | Public UI entry point | Critical heading and CTA are visible | Implemented Playwright test |
| P1 | Concurrent order reads | Error rate and p95 meet thresholds | k6 profile; needs test API |
| P2 | Duplicate specimen/order rules | Domain-specific rejection | Planned; needs requirements |
| P2 | Audit history and result publication | Actor/time/value history is correct | Planned next slice |

## Out of scope

Private endpoint details, real patient data, undocumented business rules, destructive production flows, and provider integrations without a sandbox or contract are intentionally excluded.

## Deliverables

JUnit and Playwright HTML reports, traces/screenshots on UI failure, CI logs, defect reports with correlation data, and the release decision recorded in the team’s tracking system.
