from typing import ClassVar

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "Livo Pronounce AI"
    VERSION: str = "1.0.0"

    CORS_ORIGINS: str = "https://livo-pronounce-ai.vercel.app,http://localhost:5173,http://localhost:3000"

    MODEL_NAME: str = "tiny"
    DEVICE: str = "cpu"
    COMPUTE_TYPE: str = "int8"
    BEAM_SIZE: int = 1

    MAX_AUDIO_SIZE_MB: int = 5

    MIN_DURATION: int = 30
    MAX_DURATION: int = 45

    SUPPORTED_LANGUAGES: ClassVar[list[str]] = ["en"]

    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
