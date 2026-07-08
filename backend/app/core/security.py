from fastapi import HTTPException

from app.core.config import settings

# Supported MIME types
ALLOWED_CONTENT_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
}


def validate_audio(file_bytes: bytes, content_type: str) -> bool:
    """
    Validate uploaded audio before processing.
    """

    # Empty file
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty."
        )

    # File size validation
    max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024

    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.MAX_AUDIO_SIZE_MB} MB."
        )

    # MIME type validation
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported audio format: {content_type}. "
                f"Supported formats: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
            )
        )

    return True