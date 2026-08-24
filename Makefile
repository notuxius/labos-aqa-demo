.PHONY: install test backend api public-site integration e2e live ui ui-live ui-headed lint typecheck verify

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
