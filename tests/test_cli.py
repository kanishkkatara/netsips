"""Tests for CLI and local digest extraction."""
import os
import json
import tempfile
import unittest
from backend.cli import extract_urls_from_json, run_digest


class TestCLI(unittest.TestCase):
    def test_extract_urls_from_bookmarks_export(self):
        sample_data = {
            "version": 1,
            "exportedAt": "2024-05-26T12:00:00Z",
            "bookmarks": [
                {
                    "id": "bkmk_1",
                    "title": "Local First Software",
                    "articleURL": "https://example.com/local-first",
                    "status": 100
                },
                {
                    "id": "bkmk_2",
                    "title": "Archived Article",
                    "articleURL": "https://example.com/archived",
                    "status": 102
                },
                {
                    "id": "bkmk_3",
                    "title": "Offline PWAs",
                    "articleURL": "https://example.com/pwa",
                    "status": 100
                }
            ]
        }
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
            json.dump(sample_data, f)
            temp_path = f.name

        try:
            urls = extract_urls_from_json(temp_path)
            self.assertEqual(len(urls), 2)
            self.assertIn("https://example.com/local-first", urls)
            self.assertIn("https://example.com/pwa", urls)
            self.assertNotIn("https://example.com/archived", urls)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_run_digest_empty_urls(self):
        result = run_digest(urls=[])
        self.assertIsNone(result["pdf"])
        self.assertFalse(result["delivered"])


if __name__ == "__main__":
    unittest.main()
