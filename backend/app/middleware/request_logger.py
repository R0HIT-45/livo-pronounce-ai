import logging
import time
import uuid

from fastapi import Request

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("livo")


async def log_requests(request: Request, call_next):

    request_id = str(uuid.uuid4())

    start = time.time()

    response = await call_next(request)

    process_time = round(time.time() - start, 3)

    logger.info(
        f"RID={request_id} "
        f"METHOD={request.method} "
        f"PATH={request.url.path} "
        f"STATUS={response.status_code} "
        f"TIME={process_time}s"
    )

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)

    return response