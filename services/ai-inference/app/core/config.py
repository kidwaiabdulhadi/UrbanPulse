import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://urbanpulse_admin:secure_password@localhost:5432/urbanpulse")
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "models/")
    TORCH_DEVICE: str = os.getenv("TORCH_DEVICE", "cpu")

settings = Settings()
