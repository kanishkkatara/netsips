# Netsips

> **Curate your web** — A modern, local-first browser extension and digest engine. Snooze and curate articles, videos, and reading materials while browsing, and compile automated, personalized PDF and HTML newsletter digests delivered straight to your inbox on your schedule.

---

## 📁 Repository Structure

```
netsips/
├── extension/                 # Chrome browser extension (Local-First Edition)
│   ├── manifest.json          # Manifest V3 configuration & permissions
│   ├── db.js                  # Local-first IndexedDB database & cross-tab sync
│   ├── popup.html / .js       # Action popup launcher
│   ├── popup_main.html / .js  # Saved links UI & active tab capture
│   ├── settings.html / .js    # Dashboard & tags manager with JSON backup export/import
│   ├── new.html / .js         # New tab curation interface
│   ├── event.js               # Background service worker
│   ├── content.js             # Tab content and metadata extractor
│   ├── package.json           # Extension scripts & test runner
│   └── test/                  # Automated tests for LocalDB
│
├── backend/                   # Digest processing worker & CLI services
│   ├── main.py                # Main CLI entrypoint
│   ├── cli.py                 # Argument parser & digest execution pipeline
│   ├── config.py              # Environment configuration loader
│   ├── requirements.txt       # Production dependencies
│   ├── .env.example           # Environment variables template
│   └── netsips_v4/            # Active production digest modules (PDF, HTML, SMTP)
│
├── tests/                     # Automated backend test suite (unittest / pytest)
├── .env.example               # Root environment variables template
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### 1. Browser Extension (`extension/`)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the [`extension/`](./extension) directory.
4. The Netsips icon will appear in your toolbar. All bookmarks are saved locally into your browser's private **IndexedDB** database.

### 2. Backend Digest Engine (`backend/`)

#### Setup Environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
```

#### Run CLI Digest Pipeline:

Generate a digest directly from exported extension bookmarks:
```bash
python3 -m backend.main --input exported_bookmarks.json --output-dir ./dist
```

Generate a digest from explicit URLs:
```bash
python3 -m backend.main -u "https://en.wikipedia.org/wiki/Local-first_software" --output-dir ./dist
```

Generate and dispatch email to a recipient:
```bash
python3 -m backend.main --input exported_bookmarks.json --recipient user@example.com --send
```

---

## 🧪 Running Automated Tests

### Backend Test Suite (Python)
Run all 8 automated unit tests covering configuration, CLI JSON parsing, HTML templating, and mock SMTP:
```bash
python3 -m unittest discover -s tests -v
```
Or via `pytest` (if installed):
```bash
pytest tests/ -v
```

### Extension Test Suite (Node.js)
Run the automated test suite verifying LocalDB IndexedDB/storage operations:
```bash
cd extension
npm test
```

---

## ⚙️ Environment Variables

Configuration settings are loaded from `.env` or the system environment:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port (STARTTLS) |
| `SMTP_USER` | `care.netsips@example.com` | SMTP authentication username / sender |
| `SMTP_PASS` | `""` | SMTP password / app password (dry-run if unset) |
| `SENDER_EMAIL`| `care.netsips@example.com` | From email header |
| `RECIPIENT_EMAIL` | `user@example.com` | Default recipient email address |
| `DIGEST_OUTPUT_DIR` | `./dist` | Output path for PDF and HTML digests |
| `MAX_DIGEST_ARTICLES` | `15` | Maximum number of articles per digest |

---

## 🔄 Data Lifecycle & Status Codes

Articles saved through the extension are stored locally on the user's device using zero-dependency **IndexedDB** (`NetsipsLocalDB`) with cross-context reactive broadcast sync (`BroadcastChannel` & `chrome.storage.local`):

| Status Code | Meaning |
| :--- | :--- |
| `100` | **Queued / Active**: Link saved locally by user, awaiting reading or digest |
| `101` | **Delivered**: Successfully parsed and included in sent digest |
| `102` | **Archived**: User moved card to archive (recoverable or permanently erasable) |
| `103` | **Error**: Scraper could not extract valid article body |

---

## 🔒 Security Best Practices

- Never commit real passwords, API tokens, or private credentials to git.
- Always configure secrets via environment variables or a local `.env` file (see `.env.example`).
- In test and sandbox environments without `SMTP_PASS`, the digest engine runs safely in dry-run mode, producing output files without crashing.
