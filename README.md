<div align="center">

<img src="./extension/new_icon.png" alt="Netsips Logo" width="80" height="80" />

# Netsips

**Curate your web. Read on your terms.**

*An elegant, local-first browser extension and automated digest engine that curates your reading queue into publication-grade HTML newsletters and PDF digests.*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Python: 3.8+](https://img.shields.io/badge/Python-3.8+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Chrome Extension: MV3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4.svg?logo=google-chrome&logoColor=white)](./extension)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25_Local--First-7057ff.svg)](#-local-first-data-philosophy)
[![Tests: Passing](https://img.shields.io/badge/Tests-Passing-137333.svg)](#-automated-testing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [1. Chrome Extension Setup](#1-chrome-extension-setup)
  - [2. Backend & Daemon Setup](#2-backend--daemon-setup)
- [Local Webhook Daemon & Scheduler](#-local-webhook-daemon--scheduler)
  - [HTTP Endpoints](#http-endpoints)
  - [Extension Integration](#extension-integration)
- [CLI Digest Generator](#-cli-digest-generator)
- [Configuration Reference](#-configuration-reference)
- [Automated Testing](#-automated-testing)
- [Local-First Data Philosophy](#-local-first-data-philosophy)
- [License](#-license)

---

## 🌟 Overview

The modern web is overwhelmed with ephemeral tabs, open reading lists, and fragmented bookmarks that are rarely revisited. **Netsips** fixes this by giving you a personal curation assistant right in your browser:

1. **Capture Seamlessly**: Save any article, blog post, or paper in one click with automatic tag detection, domain favicons, and metadata extraction.
2. **Read Locally**: Browse your curated library through a Google Material 3 interface across your action popup, dashboard library, or speed-dial new tab.
3. **Automate Delivery**: Run the lightweight local daemon service (`python3 -m backend.main --daemon`) to sync your queue and receive automated email digests or PDF issues directly in your inbox.

---

## ✨ Key Features

- 🔒 **100% Local-First & Zero Cloud Lock-In**:
  - All bookmarks are stored locally on your device via browser **IndexedDB** (`NetsipsLocalDB`).
  - Completely detached from third-party cloud databases or tracking servers.
  - Multi-tab reactive sync powered by browser `BroadcastChannel` and storage events.

- 🎨 **Google Material 3 Design System**:
  - Clean, minimal typography, crisp borders, subtle elevation, and purposeful micro-interactions.
  - Cohesive purple brand accent palette across Popup, New Tab speed dial, and Settings Dashboard.
  - Interactive search bar, tag filtering chips, and custom reading list organization.

- ⚡ **Local HTTP Webhook / Background Daemon**:
  - Built-in zero-dependency `ThreadingHTTPServer` (`backend/daemon.py`).
  - Trigger instant digests directly from the extension settings UI (`POST /digest`).
  - Live browser newsletter preview (`GET /preview`).
  - Automatic scheduled delivery thread running according to configured days and hours.

- 📰 **Dual-Format Publication Engine**:
  - **HTML Email Newsletter**: Responsive, magazine-style layout featuring read times, source badges, excerpts, and hero images.
  - **Printable PDF Digest**: Multi-page document generated via FPDF with cover page, table of contents, and internal navigation links.

- 📦 **Data Portability**:
  - One-click JSON backup export and import to migrate or archive your reading history anytime.

---

## 🏛 System Architecture

```
netsips/
├── extension/                     # Chrome Extension (Manifest V3)
│   ├── manifest.json              # Extension metadata and permissions
│   ├── db.js                      # Local-first IndexedDB wrapper (NetsipsLocalDB)
│   ├── popup.html / .js           # Action popup launcher
│   ├── popup_main.html / .js      # Saved links view & tab capture
│   ├── settings.html / .js        # Library dashboard, tag manager & daemon bridge
│   ├── new.html / .js             # New Tab curation & search interface
│   ├── event.js                   # Background service worker
│   ├── content.js                 # Content script for web extraction
│   ├── package.json               # Extension scripts & test config
│   └── test/                      # LocalDB automated tests
│
├── backend/                       # Digest Engine & Webhook Daemon
│   ├── main.py                    # Main executable entrypoint (`python -m backend.main`)
│   ├── cli.py                     # Argument parsing and workflow pipeline
│   ├── config.py                  # Dataclass environment configuration loader
│   ├── daemon.py                  # Local HTTP webhook server & scheduler thread
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Backend environment template
│   └── netsips_v4/                # Digest generation pipeline
│       ├── netsips_html.py        # Responsive HTML newsletter builder & scraper
│       ├── netsips_pdf.py         # Multi-page PDF generation engine
│       └── netsips_mail.py        # Secure SMTP mailer with MIME attachments
│
├── tests/                         # Automated Python unit test suite
├── .env.example                   # Root environment template
├── LICENSE                        # MIT License
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### 1. Chrome Extension Setup

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** via the toggle in the top-right corner.
3. Click **Load unpacked** and select the [`extension/`](./extension) folder.
4. Pin **Netsips** to your extension toolbar for quick access.

### 2. Backend & Daemon Setup

#### Prerequisites
- Python 3.8+
- Node.js 16+ (for extension tests)

#### Installation
```bash
# Clone the repository
git clone https://github.com/kanishkkatara/netsips.git
cd netsips

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Copy environment configuration
cp .env.example .env
```

---

## 🔌 Local Webhook Daemon & Scheduler

Run a continuous local background service that receives triggers from your browser extension and automatically checks your scheduled delivery window:

```bash
# Start daemon with default configuration (port 8765)
python3 -m backend.main --daemon
```

Custom port and host:
```bash
python3 -m backend.main --daemon --port 8765 --host 127.0.0.1
```

### HTTP Endpoints

| Endpoint | Method | Description | Example Response |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Service status, uptime, and schedule config | `{"status": "healthy", "uptime_seconds": 42}` |
| `/preview` | `GET` | Live HTML preview of latest generated newsletter | HTML Page |
| `/sync` | `POST` | Syncs active bookmarks from extension to local storage | `{"success": true, "synced_count": 12}` |
| `/digest` | `POST` | Triggers immediate digest generation & optional SMTP send | `{"success": true, "articles_processed": 5}` |

### Extension Integration

In the extension's **Settings & Library Dashboard** (`settings.html`), the **Local Digest Daemon & Webhook** card displays:
- **Live Status Pill**: Real-time indicator (`● Daemon Online` vs `○ Daemon Offline`).
- **⚡ Send Digest Now**: Sends current queued bookmarks to the daemon to compile and email your newsletter immediately.
- **Sync Bookmarks**: Updates the daemon's local cache with your latest reading list.
- **Open Live Preview**: Direct link to inspect generated HTML issues in your browser.

---

## 💻 CLI Digest Generator

You can also run one-off digest compilations directly from the command line:

### Generate Digest from Exported Bookmarks
```bash
python3 -m backend.main --input my_bookmarks.json --output-dir ./dist
```

### Direct URLs (Ad-hoc)
```bash
python3 -m backend.main -u "https://example.com/article1" -u "https://example.com/article2" --dry-run
```

### Generate & Dispatch via SMTP
```bash
python3 -m backend.main --input my_bookmarks.json --recipient reader@example.com --send
```

### Available CLI Options
```
usage: main.py [-h] [-i INPUT] [-u URLS] [-o OUTPUT_DIR] [-r RECIPIENT]
               [--send] [--daemon] [--port PORT] [--host HOST] [-v]

optional arguments:
  -h, --help            Show help message and exit
  -i, --input INPUT     Path to bookmarks JSON export
  -u, --url URLS        Direct article URL (repeatable)
  -o, --output-dir DIR  Destination directory for HTML & PDF digests (default: ./dist)
  -r, --recipient ADDR  Recipient email address for digest
  --send                Dispatch compiled digest via SMTP
  --daemon              Start local HTTP webhook and scheduler daemon
  --port PORT           Daemon HTTP port (default: 8765)
  --host HOST           Daemon bind host (default: 127.0.0.1)
  -v, --verbose         Enable verbose log output
```

---

## ⚙️ Configuration Reference

Settings can be specified in your system environment or in a local `.env` file:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp.gmail.com` | Outgoing SMTP server address |
| `SMTP_PORT` | `587` | Outgoing SMTP port (STARTTLS) |
| `SMTP_USER` | `care.netsips@example.com` | SMTP authentication user / sender |
| `SMTP_PASS` | `""` | App password (dry-run if unset) |
| `SENDER_EMAIL` | `care.netsips@example.com` | Email address displayed in `From:` header |
| `RECIPIENT_EMAIL` | `user@example.com` | Destination inbox for generated newsletters |
| `DIGEST_OUTPUT_DIR` | `./dist` | Output folder for HTML and PDF digests |
| `MAX_DIGEST_ARTICLES` | `15` | Maximum number of articles per issue |
| `DAEMON_PORT` | `8765` | Local webhook daemon HTTP port |
| `DAEMON_HOST` | `127.0.0.1` | Local webhook daemon bind address |
| `SCHEDULE_DAYS` | `everyday` | Delivery days (`everyday`, `weekdays`, or `monday,friday`) |
| `SCHEDULE_HOUR` | `8` | Hour of day (0-23) to trigger digest generation |

---

## 🧪 Automated Testing

Both the backend engine and extension database maintain complete test suites:

### 1. Python Backend Suite
Tests configuration parsing, webhook endpoints, scheduler logic, HTML generation, and mock SMTP:
```bash
python3 -m unittest discover -s tests -v
```

### 2. Extension Database Suite (Node.js)
Verifies LocalDB schema migrations, CRUD operations, query filters, and data export/import:
```bash
cd extension
npm test
```

---

## 🛡 Local-First Data Philosophy

Articles saved with Netsips follow a local-first lifecycle:

```
[ Active Web Page ] 
         │ (One-click capture)
         ▼
[ Browser IndexedDB ] ──(BroadcastChannel)──► [ Multi-Tab Sync ]
         │
         ├──► [ Read & Archive in Library Dashboard ]
         ├──► [ Export Complete JSON Backup ]
         │
         ▼ (HTTP POST /sync or /digest)
[ Local Daemon (127.0.0.1:8765) ]
         │
         ├──► [ Web Scraper & Metadata Extractor ]
         ├──► [ Responsive HTML Newsletter Generator ]
         ├──► [ Multi-Page PDF Digest Engine ]
         │
         ▼ (Optional SMTP Dispatch)
   [ Your Personal Inbox ]
```

### Article Status Codes
| Code | Status | Meaning |
| :--- | :--- | :--- |
| `100` | **Queued** | Saved locally and ready for reading or newsletter compilation |
| `101` | **Delivered** | Successfully processed and included in a generated digest |
| `102` | **Archived** | Moved to archive; recoverable or permanently erasable |
| `103` | **Error** | Article content scraper could not extract clean body text |

---

## 📄 License

This project is licensed under the terms of the [MIT License](./LICENSE).

Copyright &copy; 2024 **Kanishk Katara**. All rights reserved.
