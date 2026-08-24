.PHONY: install test backend api public-site integration e2e live
.PHONY: ui ui-live ui-headed lint typecheck verify
.PHONY: performance performance-public performance-k6

K6_IMAGE ?= grafana/k6
K6_ENV_FILE ?= .env
K6_ENV_OPTION = $(if $(wildcard $(K6_ENV_FILE)),--env-file $(K6_ENV_FILE),)

install:
	uv sync
	npm ci
	npx playwright install chromium

test: backend ui

backend:
	uv run pytest -q -m "not live"

api:
	uv run pytest -q tests/api -m "not live"

public-site:
	uv run pytest -q tests/api/public_site -m "not live"

integration:
	uv run pytest -q tests/api/integration

e2e:
	uv run pytest -q tests/api/e2e

# Add future performance suites as prerequisites of this aggregate target.
performance: performance-public performance-k6

performance-public:
	uv run pytest -q --live -m "live and performance" tests/api/public_site

performance-k6:
	@test -n "$$LABOS_API_BASE_URL" || { test -f "$(K6_ENV_FILE)" && grep -Eq '^LABOS_API_BASE_URL=.+$$' "$(K6_ENV_FILE)"; } || { echo "Set LABOS_API_BASE_URL in the shell or $(K6_ENV_FILE)"; exit 2; }
	@test -n "$$LABOS_ORDER_ID" || { test -f "$(K6_ENV_FILE)" && grep -Eq '^LABOS_ORDER_ID=.+$$' "$(K6_ENV_FILE)"; } || { echo "Set LABOS_ORDER_ID in the shell or $(K6_ENV_FILE)"; exit 2; }
	K6_IMAGE=$(K6_IMAGE) docker compose $(K6_ENV_OPTION) \
		--profile performance run --rm performance-tests

live:
	uv run pytest -q --live -m live
	npm run test:ui:live

ui:
	npm run test:ui

ui-live:
	npm run test:ui:live

ui-headed:
	npm run test:ui:headed

lint:
	uv run ruff check .
	npm run typecheck:ui

typecheck:
	uv run mypy src tests

verify: lint typecheck backend ui
