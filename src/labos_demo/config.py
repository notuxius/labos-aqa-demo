from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="LABOS_",
        extra="ignore",
    )

    api_base_url: AnyHttpUrl | None = None
    public_site_url: AnyHttpUrl = AnyHttpUrl("https://labos.co")
    environment: Literal["local", "staging", "production"] = "staging"
    timeout_seconds: float = Field(default=10.0, gt=0)
    api_token: SecretStr | None = None
    verify_ssl: bool = True
    performance_threshold_seconds: float = Field(default=5.0, gt=0)


@lru_cache
def get_settings() -> Settings:
    return Settings()
