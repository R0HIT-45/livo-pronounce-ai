import asyncio
import logging
import time

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.security import validate_audio
from app.services.speech_service import transcribe_audio
from app.services.scoring_service import scoring_service

logger = logging.getLogger(__name__)

router = APIRouter()

ANALYSIS_TIMEOUT = 180


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):

    t0 = time.perf_counter()

    try:

        logger.info(f"Received file: {file.filename}")

        audio_bytes = await file.read()
        logger.info("Read file %.2fs", time.perf_counter() - t0)

        validate_audio(
            audio_bytes,
            file.content_type
        )
        logger.info("Validation %.2fs", time.perf_counter() - t0)

        transcription = await asyncio.wait_for(
            run_in_threadpool(transcribe_audio, audio_bytes),
            timeout=ANALYSIS_TIMEOUT,
        )
        logger.info("Whisper finished %.2fs", time.perf_counter() - t0)

        duration = transcription["duration"]
        if duration < settings.MIN_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"Audio duration must be between {settings.MIN_DURATION} and {settings.MAX_DURATION} seconds."
            )
        if duration > settings.MAX_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"Audio duration must be between {settings.MIN_DURATION} and {settings.MAX_DURATION} seconds."
            )

        assessment = await run_in_threadpool(
            scoring_service.calculate_metrics,
            transcription
        )
        logger.info("Scoring finished %.2fs", time.perf_counter() - t0)

        logger.info("Returning response %.2fs", time.perf_counter() - t0)

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
