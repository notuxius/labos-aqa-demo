# Agile Quality Workflow

## Refinement and planning

- Turn customer outcomes into examples, edge cases, invariants, and measurable acceptance criteria.
- Identify service, database, integration, UI, observability, and test-data dependencies.
- Estimate automation with the story when it is part of the definition of done.
- Raise testability risks early: missing IDs, weak error contracts, unavailable sandbox, or unobservable async work.

## Implementation and review

- Pair with developers on API contracts and component boundaries.
- Review production changes for failure modes and automation changes for determinism, readability, and cleanup.
- Require tests at the lowest useful level, with only critical cross-service/UI journeys at E2E.

## Defect template

- **Title:** `[environment][component] observed failure`
- **Customer impact:** who is affected and how
- **Build/version:** commit, service, schema, browser where relevant
- **Preconditions/data:** synthetic identifiers only
- **Steps:** minimal reproducible sequence
- **Expected / actual:** business behavior and evidence
- **Diagnostics:** request/correlation IDs, sanitized logs, report/trace link
- **Severity / priority:** impact, frequency, workaround, release risk

## Demo and retrospective

Show risk reduction rather than test count: protected journey, caught regression, faster diagnosis, or removed manual effort. Track flaky tests, escaped defects, execution time, failure-detection time, and failure-triage time as improvement signals.
