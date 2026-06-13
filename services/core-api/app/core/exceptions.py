from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi import FastAPI
import logging

logger = logging.getLogger("urbanpulse")

class UrbanPulseException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class EntityNotFound(UrbanPulseException):
    def __init__(self, entity: str):
        super().__init__(message=f"{entity} not found", status_code=404)

class UnauthorizedAccess(UrbanPulseException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message=message, status_code=401)

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(UrbanPulseException)
    async def custom_exception_handler(request: Request, exc: UrbanPulseException):
        logger.warning(f"Custom Exception: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error"}
        )
