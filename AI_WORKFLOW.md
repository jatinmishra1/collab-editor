# AI Workflow Note

## Tools used

- **Claude (claude.ai)** — architecture planning, code generation, debugging, documentation
- **GitHub Copilot** — inline autocomplete during development

## Where AI materially sped up the work

### 1. FastAPI boilerplate (~45 min saved)
The full CRUD router structure — models, Pydantic schemas, SQLAlchemy session dependency injection, and the startup seed function — was generated in one prompt. What would have been 30–45 minutes of boilerplate writing was done in under 5 minutes. I reviewed every field and type carefully before running it.

### 2. Tiptap toolbar component (~30 min saved)
Generating the MenuBar component with correct `onMouseDown` + `e.preventDefault()` (essential to prevent editor blur on toolbar clicks) and the correct `chain().focus().toggle*()` call patterns. I had to add the Underline extension separately — the AI initially generated code for it but omitted the package from `package.json`.

### 3. Debugging the "file not found" bug (~20 min saved)
Claude diagnosed that `components/Editor.jsx` contained a copy of the `EditorPage` component (an accidental overwrite) and that the `loadedRef` trick prevented re-loading when navigating between documents. I verified the root cause by reading both files and confirmed the fix was correct before applying it.

### 4. Debounced autosave architecture (~15 min saved)
Claude suggested the pattern of using a `ref` for content (instead of state) to prevent the header from re-rendering on every keystroke. I tested this manually by rapidly typing and confirming the Share/Delete buttons no longer shifted.

## What AI-generated output I changed or rejected

### Changed: `loadedRef` pattern in `EditorPage`
AI initially generated a `useRef(false)` guard to prevent double-firing in React StrictMode. This worked for a single document load but broke navigation — switching documents silently showed stale content. I removed the ref and used proper state-reset in the `useEffect` instead.

### Changed: Error handling in backend routes
AI-generated routes accessed `user.id` after a DB query without checking whether `user` was `None`. This causes an `AttributeError` in Python (not a 404). I added explicit null checks to all three affected routes: `get_document`, `update_document`, and `delete_document`.

### Rejected: `markdown` `extra` extension in upload
AI used `markdown.markdown(text, extensions=["extra", "nl2br"])`. The `nl2br` extension is not part of the standard `markdown` package — it raises an `ImportError`. I replaced it with `markdown.markdown(text)` using only the built-in extensions.

### Rejected: Single `<p>` wrap for `.txt` files
AI generated `html_content = f"<p>{text.replace(chr(10), '<br>')}</p>"` which puts an entire multi-paragraph file into one paragraph. I rewrote this to split on double newlines and produce separate `<p>` tags, which renders correctly in Tiptap.

### Changed: `schemas.py` — missing `shares` field
AI generated a `Document` schema without a `shares: List[DocumentShare]` field. Without it the backend strips the shares list from every API response, so `ShareModal` always shows an empty access list. I added the field after noticing the UI bug.

## How I verified correctness

- **Manual flow testing**: created documents as Alice, shared with Bob, switched to Bob's view and confirmed the document appeared under "Shared with me" and was read-only.
- **Backend validation**: used `/docs` (FastAPI Swagger UI) to call each endpoint directly with valid and invalid inputs and confirmed correct status codes (200, 403, 404).
- **Typing stress test**: typed rapidly in the editor and watched the header to confirm no visual jitter on Share/Delete buttons after the `React.memo` + debounce fix.
- **Upload test**: imported a multi-paragraph `.md` file and verified headings and paragraphs rendered correctly in the editor.
- **Delete test**: deleted a document and confirmed its shares were cleaned up (no orphan rows in `document_shares`).
