from typing import ClassVar

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # -------------------------
    # Application
    # -------------------------

    APP_NAME: str = "Livo Pronounce AI"
    VERSION: str = "1.0.0"

    # -------------------------
    # Whisper Model
    # -------------------------

    MODEL_NAME: str = "base"
    DEVICE: str = "cpu"
    COMPUTE_TYPE: str = "int8"
    BEAM_SIZE: int = 5

    # -------------------------
    # Audio Validation
    # -------------------------

    MAX_AUDIO_SIZE_MB: int = 5

    MIN_DURATION: int = 30
    MAX_DURATION: int = 45

    SUPPORTED_LANGUAGES: ClassVar[list[str]] = ["en"]

    # -------------------------
    # Logging
    # -------------------------

    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()