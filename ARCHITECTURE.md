# Architecture Note

## What I built and why

### Core decisions

**Single-file SQLite over Postgres**  
For a 4–6 hour timebox, SQLite removes all infrastructure friction. There is nothing to provision, nothing to migrate, and the DB file travels with the project. The SQLAlchemy ORM means switching to Postgres for production is one line change in `database.py`.

**FastAPI over Django/Flask**  
FastAPI gives automatic OpenAPI docs (`/docs`), async-ready routing, and Pydantic validation out of the box. For a CRUD-heavy REST API this cuts boilerplate significantly.

**Tiptap over Quill / Draft.js / ProseMirror raw**  
Tiptap wraps ProseMirror in a React-friendly API. It ships with StarterKit (bold, italic, headings, lists, undo/redo) and the underline extension as installable packages, so there is zero custom serialisation code — content is stored and loaded as HTML strings.

**Simulated auth via user picker**  
Real JWT auth would cost 1–2 hours of scope. The assignment says "simulated users with seeded accounts" is acceptable. Three seeded users (Alice, Bob, Carol) let reviewers demonstrate the full sharing flow without a signup form.

**Debounced autosave (600ms) with refs**  
Saving on every keystroke floods the backend and causes visible UI jitter. Content is held in a React ref (not state) and flushed to the API 600ms after the last keystroke. The header is memoised (`React.memo`) so the title input and Share/Delete buttons never re-render during typing.

### What I prioritised

1. **Editing quality** — the toolbar is stable, formatting round-trips correctly through HTML storage, and the read-only view for shared users works.
2. **Sharing flow correctness** — ownership, grant, revoke, and the owned vs shared distinction in the sidebar all work end to end.
3. **Robust error handling** — every API call has null-checks on the user before accessing `.id`, cascade deletes on shares, and proper 403 vs 404 responses.

### What I deprioritised

- Real-time collaborative cursors (WebSocket infrastructure, 3–4 hours)
- `.docx` import (requires `python-docx` and HTML conversion logic)
- Role-based permissions beyond owner/viewer
- Version history

### Data model

```
users (id, email, name)
  └── documents (id, title, content, owner_id → users.id)
        └── document_shares (id, document_id → documents.id, user_email → users.email, permission)
```

### API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/users | List all users |
| GET | /api/documents?user_email= | List owned + shared docs |
| POST | /api/documents | Create document |
| GET | /api/documents/{id}?user_email= | Get single doc (auth check) |
| PUT | /api/documents/{id}?user_email= | Update title + content |
| DELETE | /api/documents/{id}?user_email= | Delete (owner only) |
| POST | /api/shares | Grant access |
| DELETE | /api/shares/{doc_id}/{email} | Revoke access |
| POST | /api/upload | Import .txt/.md file |

### Deployment options

**Railway (recommended — free tier)**  
1. Push project to GitHub.  
2. New Railway project → "Deploy from GitHub repo".  
3. Add `PORT` env var, update backend `uvicorn main:app --host 0.0.0.0 --port $PORT`.  
4. Frontend: set `VITE_API_URL` env var and update `api.js` baseURL.

**Render**  
1. Backend: New Web Service → Python → `uvicorn main:app --host 0.0.0.0 --port $PORT`.  
2. Frontend: New Static Site → `npm run build` → publish `dist/`.  
3. Set `VITE_API_URL` in Render environment variables.

**Fly.io**  
Add a `fly.toml` and `Dockerfile` — suitable for a single-container deployment that bundles both frontend static files and the FastAPI app.

### With 2–4 more hours I would add

- WebSocket autosave indicator and basic presence dot (green circle on active user)
- JWT login so users have real passwords
- Export to PDF via `weasyprint` or a browser print-to-PDF endpoint
- Cypress end-to-end test for the full create → share → switch user → view flow
