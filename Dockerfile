# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:0.12.5-python3.12-trixie-slim AS python-tests

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /workspace

COPY pyproject.toml uv.lock README.md ./
COPY src ./src
COPY tests ./tests
RUN uv sync --frozen

CMD ["uv", "run", "pytest", "-q", "-m", "not live"]


FROM mcr.microsoft.com/playwright:v1.62.1-noble AS ui-tests

WORKDIR /workspace

COPY package.json package-lock.json playwright.config.ts tsconfig.json ./
COPY tests/ui ./tests/ui
COPY tests/support/fixtures ./tests/support/fixtures
COPY tests/support/pages ./tests/support/pages
RUN npm ci

CMD ["npm", "run", "test:ui"]
