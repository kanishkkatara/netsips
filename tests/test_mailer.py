"""Tests for email dispatch and dry-run safety."""
import os
import unittest
from unittest.mock import patch, MagicMock
import backend.netsips_v4.netsips_mail as nmail


class TestMailer(unittest.TestCase):
    def test_send_dry_run_without_password(self):
        # When SMTP_PASS is unset, send should return False without crashing
        with patch.dict(os.environ, {"SMTP_PASS": "", "SMTP_PASSWORD": ""}):
            result = nmail.send("<h1>Digest</h1>", "test@example.com")
            self.assertFalse(result)

    @patch("smtplib.SMTP")
    def test_send_with_smtp_credentials(self, mock_smtp_cls):
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        with patch.dict(os.environ, {
            "SMTP_HOST": "smtp.test.com",
            "SMTP_PORT": "587",
            "SMTP_USER": "mailer@test.com",
            "SMTP_PASS": "test_pass"
        }):
            result = nmail.send("<h1>Digest</h1>", "recipient@test.com", pdf_path=None)
            self.assertTrue(result)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("mailer@test.com", "test_pass")
            mock_server.sendmail.assert_called_once()


if __name__ == "__main__":
    unittest.main()
