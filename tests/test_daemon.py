"""Tests for Netsips local webhook daemon & scheduler."""
import os
import json
import time
import unittest
import threading
from urllib.request import Request, urlopen
from http.server import ThreadingHTTPServer

from backend.config import Config
from backend.daemon import (
    create_daemon_handler,
    extract_urls_from_payload,
    DaemonScheduler,
    DAEMON_STATE
)


class TestDaemonPayload(unittest.TestCase):
    def test_extract_urls_from_dict_bookmarks(self):
        payload = {
            "bookmarks": [
                {"articleURL": "https://example.com/one", "status": 100},
                {"articleURL": "https://example.com/archived", "status": 102},
                {"url": "https://example.com/two", "status": 100}
            ]
        }
        urls = extract_urls_from_payload(payload)
        self.assertEqual(urls, ["https://example.com/one", "https://example.com/two"])

    def test_extract_urls_from_list(self):
        payload = [
            {"articleURL": "https://example.com/three", "status": 100},
            "https://example.com/direct"
        ]
        urls = extract_urls_from_payload(payload)
        self.assertEqual(urls, ["https://example.com/three", "https://example.com/direct"])


class TestDaemonServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = Config(
            digest_output_dir="/tmp/netsips_daemon_test",
            daemon_port=8912,
            daemon_host="127.0.0.1"
        )
        os.makedirs(cls.config.digest_output_dir, exist_ok=True)
        handler_cls = create_daemon_handler(cls.config)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 8912), handler_cls)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_healthcheck_endpoint(self):
        req = Request("http://127.0.0.1:8912/health")
        with urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "healthy")
            self.assertEqual(data["service"], "netsips-daemon")

    def test_preview_endpoint(self):
        req = Request("http://127.0.0.1:8912/preview")
        with urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))

    def test_sync_bookmarks_endpoint(self):
        body = json.dumps([
            {"articleURL": "https://example.com/item1", "title": "Item 1", "status": 100}
        ]).encode("utf-8")
        req = Request(
            "http://127.0.0.1:8912/sync",
            data=body,
            headers={"Content-Type": "application/json"}
        )
        with urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data["success"])
            self.assertEqual(data["synced_count"], 1)

    def test_digest_webhook_trigger(self):
        body = json.dumps({
            "urls": ["https://example.com/test-article"],
            "send_email": False
        }).encode("utf-8")
        req = Request(
            "http://127.0.0.1:8912/digest",
            data=body,
            headers={"Content-Type": "application/json"}
        )
        with urlopen(req, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data["success"])
            self.assertIn("result", data)


if __name__ == "__main__":
    unittest.main()
