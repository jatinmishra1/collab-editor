# CollabEditor

A lightweight collaborative document editor inspired by Google Docs. Built with FastAPI + React + SQLite.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Tiptap (rich-text) |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Formatting | Markdown import via `markdown` library |

## Prerequisites

- Python 3.10+ 
- Node.js 18+

## Local Setup

### 1. Clone / unzip

```bash
unzip collab-editor-fixed.zip
cd collab-editor-fixed
```

### 2. Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.  
API docs available at `http://localhost:8000/docs`.

On first run the database (`doceditor.db`) is created automatically with three seeded users:

| Name | Email |
|------|-------|
| Alice | alice@example.com |
| Bob | bob@example.com |
| Carol | carol@example.com |

### 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Usage

1. Open `http://localhost:5173` and pick a user (Alice, Bob, or Carol).
2. Create a document using the title input in the sidebar.
3. Use the rich-text toolbar to format (Bold, Italic, Underline, H1–H3, lists).
4. Click **Share** to grant another user access.
5. Switch users via the logout button and verify the shared doc appears.
6. Use **Import .txt / .md** to upload a local file and turn it into an editable document.

## Supported file types for import

`.txt` and `.md` only. `.docx` is not supported in this version.

## Running tests

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

## Project structure

```
collab-editor-fixed/
├── backend/
│   ├── main.py           # FastAPI app, CORS, startup seed
│   ├── database.py       # SQLAlchemy engine + session
│   ├── models.py         # User, Document, DocumentShare ORM models
│   ├── schemas.py        # Pydantic schemas
│   ├── requirements.txt
│   └── routers/
│       ├── documents.py  # CRUD endpoints
│       ├── shares.py     # Share / unshare endpoints
│       ├── upload.py     # File import endpoint
│       └── users.py      # User list + seeding
└── frontend/
    ├── src/
    │   ├── App.jsx           # Routing, user auth state
    │   ├── api.js            # Axios wrappers
    │   ├── pages/
    │   │   ├── Dashboard.jsx # Document list
    │   │   └── EditorPage.jsx# Edit view with debounced autosave
    │   └── components/
    │       ├── Editor.jsx    # Tiptap rich-text editor + toolbar
    │       ├── ShareModal.jsx# Share / unshare users
    │       ├── Sidebar.jsx   # Document list + create + upload
    │       └── UserPicker.jsx# Login screen
    └── package.json
```

## Deployment

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deployment options and tradeoff notes.

## What's intentionally out of scope

- Real authentication / JWT tokens (simulated via user picker)
- Real-time simultaneous editing (WebSockets)
- `.docx` file import
- Version history
