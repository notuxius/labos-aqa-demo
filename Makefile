.PHONY: install test backend api public-site integration e2e live
.PHONY: ui ui-live ui-headed lint typecheck verify
.PHONY: performance performance-public performance-k6 performance-k6-preflight
.PHONY: _performance-k6-run

K6_IMAGE ?= grafana/k6
K6_ENV_FILE ?= .env
K6_ENV_OPTION = $(if $(wildcard $(K6_ENV_FILE)),--env-file $(K6_ENV_FILE),)
NPM ?= npm
NPX ?= npx
DOCKER ?= docker
COMPOSE = $(DOCKER) compose

define run_ui
	@if command -v "$(NPM)" >/dev/null 2>&1; then \
		$(NPM) run $(1); \
	elif command -v "$(DOCKER)" >/dev/null 2>&1 && $(COMPOSE) version >/dev/null 2>&1; then \
		printf '%s\n' "npm is unavailable; running $(1) in the Playwright container."; \
		$(COMPOSE) run --build --rm ui-tests $(2) npm run $(1); \
	else \
		printf '%s\n' \
			"UI test runtime is unavailable." \
			"Install Node.js 22+ (npm/npx) or start Docker, then retry."; \
		exit 127; \
	fi
endef

install:
	uv sync
	@if command -v "$(NPM)" >/dev/null 2>&1 && command -v "$(NPX)" >/dev/null 2>&1; then \
		$(NPM) ci; \
		$(NPX) playwright install chromium; \
	elif command -v "$(DOCKER)" >/dev/null 2>&1 && $(COMPOSE) version >/dev/null 2>&1; then \
		printf '%s\n' "npm/npx are unavailable; building the Playwright container instead."; \
		$(COMPOSE) build ui-tests; \
	else \
		printf '%s\n' \
			"UI test runtime is unavailable." \
			"Install Node.js 22+ (npm/npx) or start Docker, then retry."; \
		exit 127; \
	fi

test: backend ui

backend:
	uv run pytest -q -m "not live"

api:
	uv run pytest -q tests/api -m "not live"

public-site:
	uv run pytest -q tests/support/public_site -m "not live"

integration:
	uv run pytest -q tests/support/integration

e2e:
	uv run pytest -q tests/support/business_flows

# Add future performance suites as prerequisites of this aggregate target.
performance: performance-k6-preflight performance-public _performance-k6-run

performance-public:
	uv run pytest -q --live -m "live and performance" tests/support/public_site

performance-k6: performance-k6-preflight _performance-k6-run

performance-k6-preflight:
	@missing=""; \
	has_value() { \
		test -n "$$(printenv "$$1")" || \
		{ test -f "$(K6_ENV_FILE)" && grep -Eq "^$$1=.+$$" "$(K6_ENV_FILE)"; }; \
	}; \
	has_value LABOS_API_BASE_URL || missing="$$missing LABOS_API_BASE_URL"; \
	has_value LABOS_ORDER_ID || missing="$$missing LABOS_ORDER_ID"; \
	if test -n "$$missing"; then \
		printf '%s\n' \
			"Performance preflight failed: the k6 order smoke is not configured." \
			"Missing:$$missing" \
			"Set the values in the shell or $(K6_ENV_FILE)." \
			"No k6 load test was started." \
			"Run only the available public threshold with: make performance-public"; \
		exit 2; \
	fi

_performance-k6-run:
	K6_IMAGE=$(K6_IMAGE) docker compose $(K6_ENV_OPTION) \
		--profile performance run --rm performance-tests

live:
	uv run pytest -q --live -m live
	$(call run_ui,test:ui:live)

ui:
	$(call run_ui,test:ui)

ui-live:
	$(call run_ui,test:ui:live)

ui-headed:
	$(call run_ui,test:ui:headed,xvfb-run)

lint:
	uv run ruff check .
	$(call run_ui,typecheck:ui)

typecheck:
	uv run mypy src tests

verify: lint typecheck backend ui
