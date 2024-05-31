"""Tests for backend configuration loader."""
import os
import unittest
from backend.config import Config


class TestConfig(unittest.TestCase):
    def test_default_config(self):
        cfg = Config()
        self.assertEqual(cfg.smtp_host, "smtp.gmail.com")
        self.assertEqual(cfg.smtp_port, 587)
        self.assertEqual(cfg.digest_output_dir, "./dist")
        self.assertEqual(cfg.max_articles_per_digest, 15)
        self.assertEqual(cfg.firebase_db_url, "")

    def test_config_from_env(self):
        os.environ["SMTP_HOST"] = "mail.example.org"
        os.environ["SMTP_PORT"] = "465"
        os.environ["SMTP_PASS"] = "secret_env_pass"
        os.environ["DIGEST_OUTPUT_DIR"] = "/tmp/netsips_test"
        os.environ["FIREBASE_DATABASE_URL"] = "https://custom-project.firebaseio.com/"
        try:
            cfg = Config.from_env()
            self.assertEqual(cfg.smtp_host, "mail.example.org")
            self.assertEqual(cfg.smtp_port, 465)
            self.assertEqual(cfg.smtp_pass, "secret_env_pass")
            self.assertEqual(cfg.digest_output_dir, "/tmp/netsips_test")
            self.assertEqual(cfg.firebase_db_url, "https://custom-project.firebaseio.com/")
        finally:
            os.environ.pop("SMTP_HOST", None)
            os.environ.pop("SMTP_PORT", None)
            os.environ.pop("SMTP_PASS", None)
            os.environ.pop("DIGEST_OUTPUT_DIR", None)
            os.environ.pop("FIREBASE_DATABASE_URL", None)


if __name__ == "__main__":
    unittest.main()
