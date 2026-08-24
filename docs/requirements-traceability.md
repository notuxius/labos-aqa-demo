# Vacancy Requirements Traceability

| Vacancy capability | Portfolio evidence |
|---|---|
| Python and pytest | Typed framework under `src/`; API contracts under `tests/api/`; integration and workflow suites under `tests/support/` |
| REST/backend testing | HTTPX base client, endpoint resources, status/schema/auth/timeout/5xx coverage |
| Integrations and data flows | Stateful create/retrieve workflow and API-to-SQL persistence checks |
| TypeScript Playwright | Deterministic/live specs under `tests/ui/`; page objects and HTML fixtures under `tests/support/` |
| Critical user journeys | Order business workflow plus public product-entry UI journey |
| Requirements and risk analysis | Risk-based strategy and order test plan in `docs/` |
| CI/CD | Parallel Python/UI stages, JUnit publishing, and artifact retention in `Jenkinsfile`; GitHub Actions also present |
| SQL | Parameterized SQLite repository and integration coverage |
| Debugging/root-cause analysis | Normalized client failures and `docs/failure-runbook.md` |
| Agile/SDLC collaboration | Refinement, review, defect, demo, and retrospective practices documented |
| Performance/stability | Configurable live threshold and k6 smoke profile |
| Docker/containers | Separate Python and Playwright Docker targets plus Compose |
| Reporting | JUnit for Jenkins and Playwright HTML/trace/screenshot/video artifacts |
| Medical/laboratory domain | Patient/specimen/order models and risk-focused test plan |
| AI-assisted testing | Safe-use and human-review guidelines |

## Honest gaps

- The order API is representative because no private LabOS specification or test environment is available.
- SQLite demonstrates SQL validation patterns; a real project should run the production database engine in a container.
- External/distributed integrations need provider contracts, a broker/service sandbox, and architecture details before credible tests can be implemented.
- Jenkins and container definitions are included as executable examples but still require an appropriately configured CI agent and registry.
