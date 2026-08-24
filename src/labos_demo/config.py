from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.example", ".env"),
        env_prefix="LABOS_",
        extra="ignore",
    )

    api_base_url: AnyHttpUrl | None = None
    base_url: AnyHttpUrl
    environment: Literal["local", "staging", "production"] = "staging"
    timeout_seconds: float = Field(default=10.0, gt=0)
    api_token: SecretStr | None = None
    verify_ssl: bool = True
    performance_threshold_seconds: float = Field(default=5.0, gt=0)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # populated by settings sources
