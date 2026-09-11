from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str = "pravah_secret_key_12345" # fallback for dev
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    PROJECT_NAME: str = "PRAVAH Backend"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./pravah.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
