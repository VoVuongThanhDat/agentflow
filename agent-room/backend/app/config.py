from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CLAUDE_CLI_PATH: str = "claude"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLY_SPECS_DIR: str = str(Path(__file__).parent.parent.parent.parent)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
