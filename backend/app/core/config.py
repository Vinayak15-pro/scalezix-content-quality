from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Scalezix Content Quality & Factuality Checker"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    APP_ENV: str = "production"
    
    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash"
    
    # Validation constraints
    MAX_DRAFT_CHARS: int = 25000
    MIN_DRAFT_CHARS: int = 15
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*"
    ]

settings = Settings()
