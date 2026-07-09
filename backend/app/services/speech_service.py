import logging
import os
import tempfile

from faster_whisper import WhisperModel
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

_model = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        logger.info(
            "Loading Whisper model '%s' on %s...",
            settings.MODEL_NAME,
            settings.DEVICE,
        )
        _model = WhisperModel(
            settings.MODEL_NAME,
            device=settings.DEVICE,
            compute_type=settings.COMPUTE_TYPE,
        )
        logger.info("Whisper model loaded successfully.")
    return _model


def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribes an audio file using Faster-Whisper.
    """

    temp_path = None

    try:
        # -----------------------------
        # Save uploaded audio temporarily
        # -----------------------------
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as temp:

            temp.write(audio_bytes)
            temp_path = temp.name

        logger.info("Starting transcription...")

        segments, info = get_model().transcribe(
            temp_path,
            beam_size=settings.BEAM_SIZE,
            word_timestamps=True,
        )

        transcript_parts = []
        words = []

        for segment in segments:

            text = segment.text.strip()

            if text:
                transcript_parts.append(text)

            if segment.words:
                for word in segment.words:
                    words.append({
                        "word": word.word.strip(),
                        "start": round(word.start, 2),
                        "end": round(word.end, 2),
                        "probability": round(word.probability, 4),
                    })

        transcript = " ".join(transcript_parts).strip()

        # -----------------------------
        # No Speech Detection
        # -----------------------------
        if not transcript or len(words) == 0:
            raise HTTPException(
                status_code=400,
                detail="No speech detected in the uploaded audio."
            )

        # -----------------------------
        # Language Validation
        # -----------------------------
        if info.language not in settings.SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language detected: {info.language}"
            )

        logger.info("Transcription completed successfully.")

        return {
            "language": info.language,
            "duration": round(info.duration, 2),
            "transcript": transcript,
            "words": words,
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception("Speech transcription failed.")

        raise HTTPException(
            status_code=500,
            detail="Failed to transcribe audio."
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                logger.warning(
                    "Unable to delete temporary file: %s",
                    temp_path,
                )