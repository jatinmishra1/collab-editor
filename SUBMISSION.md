# Submission

**Candidate:** Jatin Mishra  
**Assignment:** Ajaia LLC — AI-Native Full Stack Developer

---

## What is included

| File / Folder | Description |
|---|---|
| `backend/` | FastAPI backend — models, routers, database, schemas |
| `frontend/` | React + Vite frontend — editor, sharing, sidebar |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | What was prioritised and why, data model, API surface, deployment |
| `AI_WORKFLOW.md` | AI tools used, what was changed/rejected, verification approach |
| `SUBMISSION.md` | This file |
| `backend/tests/test_documents.py` | Automated backend tests |

---

## What is working end to end

- **Document creation** — title + content, persisted to SQLite
- **Rich-text editing** — Bold, Italic, Underline, H1/H2/H3, bullet lists, numbered lists, blockquote, undo/redo
- **Rename** — edit the title field inline; debounced autosave fires 600ms after last keypress
- **Save and reopen** — documents survive browser refresh; HTML content round-trips correctly
- **File import** — upload `.txt` or `.md` files; content converted to editable HTML document
- **Sharing** — owner can grant/revoke access by email; shared docs appear under "Shared with me" in the sidebar; non-owners get read-only view
- **Persistence** — SQLite DB; shares survive refresh
- **Error handling** — 403/404 responses for missing/unauthorised access; null-checks throughout

---

## What is intentionally out of scope

| Feature | Reason not built |
|---|---|
| Real authentication / JWT | Scope; user picker + seeded accounts demonstrates the sharing logic cleanly |
| Real-time collaboration cursors | Requires WebSocket infrastructure (~3–4 hours extra) |
| `.docx` import | Requires `python-docx` + HTML conversion; `.txt`/`.md` covers the requirement |
| Version history | Stretch goal; core features prioritised |
| Role-based permissions (editor vs viewer) | Beyond "basic access" requirement |

---

## What I would build next with 2–4 more hours

1. **JWT auth** — real login with email + password so reviewers don't need to use the user picker
2. **Live deployment** — Docker + Fly.io for a single-container deploy with the frontend served by FastAPI as static files
3. **Export to Markdown** — `editor.getText()` + download blob, ~30 min
4. **Presence indicator** — small green dot next to documents currently open by another user
5. **Cypress E2E test** — full create → share → switch user → read-only check flow

---

## Test accounts for reviewing sharing

| User | Email | Password |
|---|---|---|
| Alice | alice@example.com | *(no password — click to select)* |
| Bob | bob@example.com | *(no password — click to select)* |
| Carol | carol@example.com | *(no password — click to select)* |

**Suggested review flow:**
1. Select **Alice** → create a document → click **Share** → enter `bob@example.com`
2. Select **Bob** → see the document under "Shared with me" → confirm it is read-only
3. Select **Alice** → click Share → remove Bob
4. Select **Bob** → confirm document is gone from the list

---

## Live deployment URL

> *(to be added after deployment — see ARCHITECTURE.md for deployment steps)*

## Walkthrough video

> *(to be added — unlisted YouTube / Loom link)*
