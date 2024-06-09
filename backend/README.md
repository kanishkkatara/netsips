# Netsips Backend

The backend engine for **Netsips**, responsible for transforming saved bookmark collections into beautiful, curated digest newsletters (both responsive HTML and downloadable PDF formats), serving a local HTTP webhook daemon, and dispatching digests via SMTP.

## Architecture

```
backend/
├── __init__.py           # Package marker
├── cli.py                # Command-line interface and workflow orchestrator
├── config.py             # Environment-based configuration dataclass
├── daemon.py             # Local HTTP webhook server and background scheduler
├── main.py               # Package execution entrypoint (`python -m backend.main`)
├── netsips_v4/           # Core digest processing pipeline
│   ├── netsips_html.py   # Responsive HTML newsletter generator & web scraper
│   ├── netsips_pdf.py    # Multi-page PDF generation engine (FPDF)
│   └── netsips_mail.py   # Secure SMTP email sender with MIME multipart support
└── requirements.txt      # Python dependencies
```

## Features

1. **Local-First & Offline Compatible**: Direct ingestion of exported JSON bookmarks from the Chrome extension (`LocalDB.exportData()` or browser bookmarks export).
2. **Local HTTP Webhook / Daemon (`--daemon`)**:
   - Zero-dependency `ThreadingHTTPServer` running locally on `http://127.0.0.1:8765`.
   - Listens for triggers from the Chrome extension to build and send digests immediately (`POST /digest`).
   - Syncs active bookmarks directly from the browser (`POST /sync`).
   - Live browser preview endpoint (`GET /preview`).
   - Integrated background thread scheduler that checks scheduled delivery days and hours automatically.
3. **Dual-Format Generation**:
   - **HTML Digest**: Clean, responsive email layout with typography, source badges, read times, and article excerpts.
   - **PDF Newsletter**: Formatted multi-page document with cover page, table of contents, and internal page links.
4. **Environment Security**: No hardcoded credentials; fully configurable via environment variables or `.env` files.
5. **Dry-Run Mode**: Allows testing digest generation and parsing without sending real emails.
6. **Graceful Degradation**: Missing optional dependencies (e.g. `fpdf`) do not crash the pipeline.

## Installation

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

## Environment Variables

Copy `backend/.env.example` to `.env` or set environment variables in your shell:

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host server |
| `SMTP_PORT` | `587` | SMTP port (STARTTLS) |
| `SMTP_USER` | `""` | SMTP username / sender account |
| `SMTP_PASS` | `""` | SMTP password or app-specific password (dry-run if unset) |
| `SENDER_EMAIL` | `""` | From address header in outgoing email |
| `RECIPIENT_EMAIL`| `""` | Destination email address for digest |
| `DIGEST_OUTPUT_DIR`| `./dist` | Destination folder for generated HTML & PDF files |
| `MAX_DIGEST_ARTICLES`| `15` | Maximum number of articles per newsletter issue |
| `DAEMON_PORT` | `8765` | Local webhook daemon HTTP port |
| `DAEMON_HOST` | `127.0.0.1` | Local webhook daemon bind address |
| `SCHEDULE_DAYS` | `everyday` | Scheduled delivery days (`everyday`, `weekdays`, or `monday,friday`) |
| `SCHEDULE_HOUR` | `8` | Hour of day (0-23) to trigger scheduled digest |

## Running the Webhook Daemon

To run the local background service listening for triggers from the Chrome extension and evaluating the delivery schedule:

```bash
python3 -m backend.main --daemon
```

Custom port and host:
```bash
python3 -m backend.main --daemon --port 8765 --host 127.0.0.1
```

### Daemon HTTP Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` or `/status` | `GET` | Health check returning daemon uptime, configuration, and scheduler status |
| `/preview` | `GET` | Renders the latest generated HTML digest newsletter directly in the browser |
| `/digest` | `POST` | Compiles a digest from received `{ bookmarks: [...] }` or synced cache and dispatches email |
| `/sync` | `POST` | Receives active bookmarks from extension and saves to local storage |

## CLI Usage

### Generate Digest from Local Bookmarks File

```bash
python3 -m backend.main --input bookmarks.json --recipient user@example.com
```

### Dry Run (Generate HTML and PDF without sending email)

```bash
python3 -m backend.main --input bookmarks.json --dry-run
```

### Direct URLs

```bash
python3 -m backend.main --urls "https://example.com/article1" "https://example.com/article2" --dry-run
```

### Generate Specific Formats

```bash
# HTML only
python3 -m backend.main --input bookmarks.json --no-pdf

# Custom output directory
python3 -m backend.main --input bookmarks.json --output-dir ./my_digests
```

## Testing

Run unit tests across all backend modules:

```bash
python3 -m unittest discover -s tests -v
```
