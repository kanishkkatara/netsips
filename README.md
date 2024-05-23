# Netsips

> **Curate your web** — Snooze and curate articles, videos, and reading materials while browsing, and receive an automated, personalized PDF and HTML newsletter digest delivered straight to your inbox on your schedule.

---

## 📁 Repository Structure

```
netsips/
├── extension/                 # Chrome browser extension (Local-First Edition)
│   ├── manifest.json          # Extension manifest & permissions (MV3)
│   ├── db.js                  # Local-first IndexedDB persistent database & sync
│   ├── popup.html / .js       # Action popup launcher
│   ├── popup_main.html / .js  # Saved links UI & current page capture
│   ├── settings.html / .js    # Saved dashboard & tags manager (with JSON export/import)
│   ├── new.html / .js         # New tab curation interface
│   ├── event.js               # Background service worker
│   ├── content.js             # Tab content extractor
│   ├── fonts/                 # Custom typography (Raleway, Manrope, Work Sans)
│   └── images/                # UI icons and graphics
│
└── backend/                   # Digest processing worker & legacy services
    ├── netsips_v4/            # Active production digest worker
    │   ├── netsips_v4_main.py # Main scheduler script
    │   ├── netsips_pdf.py     # PDF digest generator (FPDF)
    │   ├── netsips_html.py    # HTML newsletter template generator
    │   └── netsips_mail.py    # SMTP email dispatcher
    ├── netsips_v3/            # Intermediate version
    ├── requirements.txt       # Python dependencies
    ├── .env.example           # Environment variables template
    └── README.md              # Backend legacy notes
```

---

## 🚀 Getting Started

### 1. Browser Extension (`extension/`)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the [`extension/`](./extension) directory.
4. The Netsips icon will appear in your browser toolbar.

### 2. Backend Digest Worker (`backend/`)

The backend queries Firebase for users whose delivery day matches today's weekday, extracts queued articles (`status == 100`), compiles the digest PDF & HTML, and sends it via email.

#### Prerequisites:
- Python 3.8+
- Active Firebase project credentials (`firebase-sdk.json`)

#### Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Running the Worker:
```bash
cd netsips_v4
python netsips_v4_main.py
```

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

## 🔒 Security Notice

- Never commit real API keys, Gmail passwords, or `firebase-sdk.json` service account files to git.
- Always configure secrets via environment variables or a `.env` file (see `backend/.env.example`).
