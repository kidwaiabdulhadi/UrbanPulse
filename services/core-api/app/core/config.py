from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UrbanPulse AI Core API"
    POSTGRES_USER: str = "urbanpulse_admin"
    POSTGRES_PASSWORD: str = "secure_password"
    POSTGRES_DB: str = "urbanpulse"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "super_secret_jwt_key_here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
