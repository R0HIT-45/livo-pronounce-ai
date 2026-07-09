import asyncio
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.core.security import validate_audio
from app.services.speech_service import transcribe_audio
from app.services.scoring_service import scoring_service

logger = logging.getLogger(__name__)

router = APIRouter()

ANALYSIS_TIMEOUT = 120


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):

    try:

        logger.info(f"Received file: {file.filename}")

        audio_bytes = await file.read()

        validate_audio(
            audio_bytes,
            file.content_type
        )

        transcription = await asyncio.wait_for(
            run_in_threadpool(transcribe_audio, audio_bytes),
            timeout=ANALYSIS_TIMEOUT,
        )

        assessment = await run_in_threadpool(
            scoring_service.calculate_metrics,
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

    except asyncio.TimeoutError:
        logger.error("Analysis timed out after %ss", ANALYSIS_TIMEOUT)
        raise HTTPException(
            status_code=504,
            detail="Analysis timed out. Please try again."
        )

    except HTTPException:
        raise

    except Exception:

        logger.exception("Unexpected error during analysis.")

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze audio."
        )
