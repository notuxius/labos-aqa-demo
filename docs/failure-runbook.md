# Test Failure and Root-Cause Runbook

## Triage order

1. Confirm the failing build, commit, environment, service version, and test-data identifiers.
2. Classify the failure: product regression, environment/dependency, test defect, data collision, or known instability.
3. Read the normalized API operation/status, Jenkins console, JUnit output, and Playwright trace before rerunning.
4. Correlate timestamps and request IDs with service, ingress, database, and integration logs.
5. Reproduce with the smallest deterministic test; use a staging request only when the mock contract passes.
6. Report a defect or automation issue with evidence and impact. Do not hide a failure with retries.

## Evidence checklist

- Build URL, commit SHA, environment, and deployed service versions
- Exact failing test and marker
- Sanitized request method/path/status; never credentials or patient data
- Expected versus actual result
- Logs and correlation/request IDs with a narrow timestamp window
- Playwright trace/screenshot/video for UI failures
- Reproduction frequency and last known passing build
- Customer and release impact

## Safe production investigation

Use read-only calls, synthetic tenant/data, redacted logs, least-privilege credentials, and approved observability tools. Never replay mutations or copy patient data into local reports.
