from fastapi import APIRouter, UploadFile, File, HTTPException
import logging

from app.core.security import validate_audio
from app.services.speech_service import transcribe_audio
from app.services.scoring_service import scoring_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyze uploaded speech and return pronunciation assessment.
    """

    try:

        logger.info(f"Received file: {file.filename}")

        audio_bytes = await file.read()

        validate_audio(
            audio_bytes,
            file.content_type
        )

        transcription = transcribe_audio(audio_bytes)

        assessment = scoring_service.calculate_metrics(
            transcription
        )

        logger.info("Speech analysis completed successfully.")

        return {
            "success": True,
            "transcription": transcription["transcript"],
            "language": transcription["language"],
            "duration": transcription["duration"],
            "assessment": assessment
        }

    except HTTPException:
        raise

    except Exception:

        logger.exception("Unexpected error during analysis.")

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze audio."
        )