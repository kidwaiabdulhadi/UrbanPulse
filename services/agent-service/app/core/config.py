import os

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "sk-mock-key")
    AI_INFERENCE_URL: str = os.getenv("AI_INFERENCE_URL", "http://localhost:8002/api/v1")
    CORE_API_URL: str = os.getenv("CORE_API_URL", "http://localhost:8000/api/v1")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")

settings = Settings()
