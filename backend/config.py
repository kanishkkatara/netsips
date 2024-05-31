"""
Netsips Backend Configuration Module
Production-ready configuration loader with environment variable support.
"""

import os
from dataclasses import dataclass
from typing import Optional

# Optional dotenv support if installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


@dataclass
class Config:
    # SMTP & Email Settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "care.netsips@example.com"
    smtp_pass: str = ""
    sender_email: str = "care.netsips@example.com"
    recipient_email: str = "user@example.com"

    # Digest Generation Settings
    digest_output_dir: str = "./dist"
    max_articles_per_digest: int = 15
    default_delivery_day: int = 6

    # Legacy Firebase Settings (Optional)
    firebase_db_url: str = ""
    firebase_credentials_path: Optional[str] = "./firebase-sdk.json"

    @classmethod
    def from_env(cls) -> "Config":
        """Instantiate configuration directly from environment variables."""
        return cls(
            smtp_host=os.environ.get("SMTP_HOST", "smtp.gmail.com"),
            smtp_port=int(os.environ.get("SMTP_PORT", 587)),
            smtp_user=os.environ.get("SMTP_USER", os.environ.get("SENDER_EMAIL", "care.netsips@example.com")),
            smtp_pass=os.environ.get("SMTP_PASS", os.environ.get("SMTP_PASSWORD", "")),
            sender_email=os.environ.get("SENDER_EMAIL", os.environ.get("SMTP_USER", "care.netsips@example.com")),
            recipient_email=os.environ.get("RECIPIENT_EMAIL", "user@example.com"),
            digest_output_dir=os.environ.get("DIGEST_OUTPUT_DIR", "./dist"),
            max_articles_per_digest=int(os.environ.get("MAX_DIGEST_ARTICLES", 15)),
            default_delivery_day=int(os.environ.get("DEFAULT_DELIVERY_DAY", 6)),
            firebase_db_url=os.environ.get("FIREBASE_DATABASE_URL", ""),
            firebase_credentials_path=os.environ.get("FIREBASE_CREDENTIALS_PATH", "./firebase-sdk.json"),
        )
