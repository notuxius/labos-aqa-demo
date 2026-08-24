import pytest

from labos_demo.config import Settings


def test_settings_accepts_explicit_base_url() -> None:
    settings = Settings.model_validate(
        {"base_url": "https://explicit.example.test"}
    )

    assert str(settings.base_url) == "https://explicit.example.test/"


def test_settings_reads_labos_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LABOS_BASE_URL", "https://environment.example.test")

    settings = Settings(_env_file=None)  # type: ignore[call-arg]

    assert str(settings.base_url) == "https://environment.example.test/"
