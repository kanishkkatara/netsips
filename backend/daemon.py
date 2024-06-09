"""
Netsips Local Webhook Daemon & Background Scheduler
Runs a lightweight, local-first HTTP service for receiving extension triggers,
serving live HTML newsletter previews, and executing scheduled digests.
"""

import os
import sys
import json
import time
import signal
import logging
import datetime
import threading
from typing import List, Dict, Any, Optional
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

from backend.config import Config
from backend.cli import run_digest

logger = logging.getLogger("netsips.daemon")

# Global daemon state
DAEMON_STATE = {
    "start_time": time.time(),
    "last_digest_run": None,
    "last_digest_result": None,
    "synced_count": 0
}


def extract_urls_from_payload(payload: Any) -> List[str]:
    """Extract valid URLs from diverse JSON payload structures."""
    urls = []
    if isinstance(payload, dict):
        if "urls" in payload and isinstance(payload["urls"], list):
            for u in payload["urls"]:
                if isinstance(u, str) and u.startswith("http"):
                    urls.append(u)
        raw_items = payload.get("bookmarks") or payload.get("list") or payload.get("items")
        if isinstance(raw_items, list):
            for item in raw_items:
                if isinstance(item, dict):
                    url = item.get("articleURL") or item.get("URL") or item.get("url")
                    status = item.get("status", 100)
                    if url and status != 102 and url not in urls:
                        urls.append(url)
                elif isinstance(item, str) and item.startswith("http") and item not in urls:
                    urls.append(item)
    elif isinstance(payload, list):
        for item in payload:
            if isinstance(item, dict):
                url = item.get("articleURL") or item.get("URL") or item.get("url")
                status = item.get("status", 100)
                if url and status != 102 and url not in urls:
                    urls.append(url)
            elif isinstance(item, str) and item.startswith("http") and item not in urls:
                urls.append(item)
    return urls


def create_daemon_handler(config: Config):
    """Factory to create a RequestHandler with injected configuration."""

    class DaemonRequestHandler(BaseHTTPRequestHandler):
        def _set_headers(self, status_code: int = 200, content_type: str = "application/json"):
            self.send_response(status_code)
            self.send_header("Content-Type", content_type)
            # Full CORS support for browser extensions and localhost tools
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            self.end_headers()

        def do_OPTIONS(self):
            """Handle preflight CORS requests."""
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            self.end_headers()

        def do_GET(self):
            parsed = urlparse(self.path)
            path = parsed.path.rstrip("/")

            if path in ("", "/health", "/status"):
                uptime = int(time.time() - DAEMON_STATE["start_time"])
                resp = {
                    "status": "healthy",
                    "service": "netsips-daemon",
                    "version": "1.5.0",
                    "uptime_seconds": uptime,
                    "schedule_days": config.daemon_schedule_days,
                    "schedule_hour": config.daemon_schedule_hour,
                    "last_digest": DAEMON_STATE["last_digest_result"]
                }
                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))

            elif path == "/preview":
                html_path = os.path.join(config.digest_output_dir, "netsips_digest.html")
                if os.path.exists(html_path):
                    with open(html_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    self._set_headers(200, "text/html; charset=utf-8")
                    self.wfile.write(content.encode("utf-8"))
                else:
                    self._set_headers(200, "text/html; charset=utf-8")
                    placeholder = (
                        "<html><body style='font-family: sans-serif; text-align: center; padding: 50px; color: #5f6368;'>"
                        "<h2 style='color: #5a2cb6;'>Netsips Local Digest Preview</h2>"
                        "<p>No newsletter digest generated yet. Trigger a digest from the extension or via POST /digest.</p>"
                        "</body></html>"
                    )
                    self.wfile.write(placeholder.encode("utf-8"))

            else:
                self._set_headers(404, "application/json")
                self.wfile.write(json.dumps({"error": "Not Found", "path": self.path}).encode("utf-8"))

        def do_POST(self):
            parsed = urlparse(self.path)
            path = parsed.path.rstrip("/")

            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length) if content_length > 0 else b"{}"

            try:
                payload = json.loads(post_body.decode("utf-8")) if post_body else {}
            except Exception as e:
                self._set_headers(400, "application/json")
                self.wfile.write(json.dumps({"error": f"Invalid JSON payload: {e}"}).encode("utf-8"))
                return

            if path in ("/webhook/digest", "/digest", "/trigger"):
                urls = extract_urls_from_payload(payload)

                # Persist synced bookmarks locally if full list provided
                synced_path = os.path.join(config.digest_output_dir, "synced_bookmarks.json")
                if "bookmarks" in payload and isinstance(payload["bookmarks"], list):
                    os.makedirs(config.digest_output_dir, exist_ok=True)
                    with open(synced_path, "w", encoding="utf-8") as f:
                        json.dump(payload["bookmarks"], f, indent=2)
                    DAEMON_STATE["synced_count"] = len(payload["bookmarks"])

                # Fallback to previously synced file if no URLs sent
                if not urls and os.path.exists(synced_path):
                    with open(synced_path, "r", encoding="utf-8") as f:
                        saved = json.load(f)
                    urls = extract_urls_from_payload(saved)

                if not urls:
                    urls = [
                        "https://en.wikipedia.org/wiki/Local-first_software",
                        "https://en.wikipedia.org/wiki/Progressive_web_app"
                    ]

                recipient = payload.get("recipient") or config.recipient_email
                send_email = payload.get("send_email", False)
                if "send" in payload:
                    send_email = bool(payload["send"])

                logger.info(f"Executing webhook digest for {len(urls)} URLs (send_email={send_email})...")
                result = run_digest(
                    urls=urls,
                    output_dir=config.digest_output_dir,
                    recipient=recipient,
                    send_email=send_email,
                    config=config
                )

                DAEMON_STATE["last_digest_run"] = time.time()
                DAEMON_STATE["last_digest_result"] = result

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Digest generated successfully",
                    "result": result
                }, indent=2).encode("utf-8"))

            elif path in ("/sync", "/bookmarks"):
                bookmarks = payload.get("bookmarks") if isinstance(payload, dict) else payload
                if isinstance(bookmarks, list):
                    os.makedirs(config.digest_output_dir, exist_ok=True)
                    synced_path = os.path.join(config.digest_output_dir, "synced_bookmarks.json")
                    with open(synced_path, "w", encoding="utf-8") as f:
                        json.dump(bookmarks, f, indent=2)
                    DAEMON_STATE["synced_count"] = len(bookmarks)
                    self._set_headers(200, "application/json")
                    self.wfile.write(json.dumps({
                        "success": True,
                        "synced_count": len(bookmarks),
                        "saved_to": synced_path
                    }).encode("utf-8"))
                else:
                    self._set_headers(400, "application/json")
                    self.wfile.write(json.dumps({"error": "Payload must be a list of bookmarks"}).encode("utf-8"))

            else:
                self._set_headers(404, "application/json")
                self.wfile.write(json.dumps({"error": "Unknown webhook endpoint", "path": self.path}).encode("utf-8"))

        def log_message(self, format, *args):
            logger.debug(f"%s - - [%s] {format % args}" % (self.client_address[0], self.log_date_time_string()))

    return DaemonRequestHandler


class DaemonScheduler(threading.Thread):
    """Background scheduler thread running inside the daemon process."""

    def __init__(self, config: Config, check_interval: int = 60):
        super().__init__(daemon=True)
        self.config = config
        self.check_interval = check_interval
        self.stop_event = threading.Event()
        self.last_delivered_date: Optional[str] = None

    def run(self):
        logger.info(
            f"Background scheduler started (days='{self.config.daemon_schedule_days}', "
            f"hour={self.config.daemon_schedule_hour}:00)."
        )
        while not self.stop_event.is_set():
            try:
                now = datetime.datetime.now()
                today_str = now.strftime("%Y-%m-%d")
                weekday_str = str(now.weekday())

                scheduled_days = self.config.daemon_schedule_days.split()
                is_scheduled_day = weekday_str in scheduled_days
                is_scheduled_hour = (now.hour >= self.config.daemon_schedule_hour)
                already_ran_today = (self.last_delivered_date == today_str)

                if is_scheduled_day and is_scheduled_hour and not already_ran_today:
                    logger.info(f"Triggering scheduled digest for {today_str} (weekday {weekday_str})...")
                    synced_path = os.path.join(self.config.digest_output_dir, "synced_bookmarks.json")
                    urls = []
                    if os.path.exists(synced_path):
                        with open(synced_path, "r", encoding="utf-8") as f:
                            saved = json.load(f)
                        urls = extract_urls_from_payload(saved)

                    if urls:
                        result = run_digest(
                            urls=urls,
                            output_dir=self.config.digest_output_dir,
                            recipient=self.config.recipient_email,
                            send_email=bool(self.config.smtp_pass),
                            config=self.config
                        )
                        DAEMON_STATE["last_digest_run"] = time.time()
                        DAEMON_STATE["last_digest_result"] = result
                        logger.info(f"Scheduled digest completed: {result}")
                    else:
                        logger.info("No synced bookmarks available to deliver today.")

                    self.last_delivered_date = today_str

            except Exception as e:
                logger.error(f"Error in scheduler check: {e}", exc_info=True)

            self.stop_event.wait(self.check_interval)

    def stop(self):
        self.stop_event.set()


def run_daemon(host: str = "127.0.0.1", port: int = 8765, config: Optional[Config] = None):
    """Main execution function for starting the local webhook daemon."""
    config = config or Config.from_env()
    server_address = (host, port)
    handler_class = create_daemon_handler(config)
    httpd = ThreadingHTTPServer(server_address, handler_class)

    scheduler = DaemonScheduler(config, check_interval=30)
    scheduler.start()

    logger.info(f"=====================================================")
    logger.info(f" Netsips Webhook Daemon running at http://{host}:{port}/")
    logger.info(f" Health check:  http://{host}:{port}/health")
    logger.info(f" Live preview:  http://{host}:{port}/preview")
    logger.info(f" Webhook URL:   http://{host}:{port}/digest (POST)")
    logger.info(f"=====================================================")

    def shutdown_handler(signum, frame):
        logger.info("\nShutting down Netsips daemon gracefully...")
        scheduler.stop()
        threading.Thread(target=httpd.shutdown).start()

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        httpd.serve_forever()
    except Exception as e:
        logger.info(f"Daemon stopped: {e}")
    finally:
        httpd.server_close()
        logger.info("Netsips daemon closed cleanly.")
