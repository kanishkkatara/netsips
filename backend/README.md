# Netsips Backend

The backend engine for **Netsips**, responsible for transforming saved bookmark collections into beautiful, curated digest newsletters (both responsive HTML and downloadable PDF formats) and dispatching them via SMTP.

## Architecture

```
backend/
├── __init__.py           # Package marker
├── cli.py                # Command-line interface and workflow orchestrator
├── config.py             # Environment-based configuration dataclass
├── main.py               # Package execution entrypoint (`python -m backend.main`)
├── netsips_v4/           # Core digest processing pipeline
│   ├── netsips_html.py   # Responsive HTML newsletter generator & web scraper
│   ├── netsips_pdf.py    # Multi-page PDF generation engine (FPDF)
│   ├── netsips_mail.py   # Secure SMTP email sender with MIME multipart support
│   └── netsips_v4_main.py # Legacy cloud database worker
└── requirements.txt      # Python dependencies
```

## Features

1. **Local-First & Offline Compatible**: Direct ingestion of exported JSON bookmarks from the Chrome extension (`LocalDB.exportData()` or browser bookmarks export).
2. **Dual-Format Generation**:
   - **HTML Digest**: Clean, responsive email layout with typography, source badges, read times, and article excerpts.
   - **PDF Newsletter**: Formatted multi-page document with cover page, table of contents, and internal page links.
3. **Environment Security**: No hardcoded credentials; fully configurable via environment variables or `.env` files.
4. **Dry-Run Mode**: Allows testing digest generation and parsing without sending real emails.
5. **Graceful Degradation**: Missing optional dependencies (e.g. `fpdf`) or missing Firebase credentials do not crash the pipeline.

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
| `FIREBASE_DATABASE_URL`| `""` | Optional Firebase database URL (legacy sync) |
| `FIREBASE_CREDENTIALS_PATH`| `./firebase-sdk.json` | Optional Firebase service account key |

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
