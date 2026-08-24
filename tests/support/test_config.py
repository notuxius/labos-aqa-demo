import pytest

from labos_demo.config import Settings


def test_settings_reads_shared_base_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LABOS_BASE_URL", "https://public.example.test")

    settings = Settings()  # type: ignore[call-arg]  # populated from the test environment

    assert str(settings.base_url) == "https://public.example.test/"
