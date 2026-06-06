import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocument, updateDocument, deleteDocument } from "../api";
import Editor from "../components/Editor";
import ShareModal from "../components/ShareModal";

// ── Memoised header so it NEVER re-renders while the user is typing ──────────
// It only re-renders when title / isOwner / saveStatus actually change.
const DocHeader = memo(function DocHeader({
  title,
  isOwner,
  saveStatus,
  onTitleChange,
  onShare,
  onDelete,
}) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center flex-shrink-0">
      <input
        type="text"
        value={title}
        onChange={onTitleChange}
        disabled={!isOwner}
        placeholder="Untitled document"
        className="text-xl font-semibold bg-transparent border-b border-transparent
          focus:border-indigo-300 outline-none flex-1 mr-4 disabled:text-gray-600"
      />
      <div className="flex items-center gap-2 min-w-fit">
        {!isOwner && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            View only
          </span>
        )}
        {isOwner && (
          <>
            <button
              onClick={onShare}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            >
              Share
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Delete
            </button>
          </>
        )}
        {/* Fixed-width slot so layout never shifts */}
        <span className="text-xs text-gray-400 w-14 text-right">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved"  && "Saved ✓"}
        </span>
      </div>
    </div>
  );
});

// ── Debounce helper ───────────────────────────────────────────────────────────
function useDebouncedCallback(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EditorPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc]           = useState(null);
  const [title, setTitle]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [isOwner, setIsOwner]   = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved"
  const [errorMsg, setErrorMsg] = useState(null);

  // Keep latest title/content in refs so debounced save always uses fresh values
  // WITHOUT those values being deps of the save callback (which would cancel debounce).
  const titleRef   = useRef("");
  const contentRef = useRef("");
  const isOwnerRef = useRef(false);

  // ── Load document ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !currentUser?.email) {
      setErrorMsg("Missing document ID or user.");
      setLoading(false);
      return;
    }
    setDoc(null);
    setTitle("");
    setErrorMsg(null);
    setLoading(true);
    setIsOwner(false);
    setSaveStatus("idle");
    titleRef.current   = "";
    contentRef.current = "";
    isOwnerRef.current = false;

    getDocument(id, currentUser.email)
      .then((res) => {
        if (res.status === 200 && res.data) {
          const d = res.data;
          setDoc(d);
          setTitle(d.title);
          titleRef.current   = d.title;
          contentRef.current = d.content || "";
          const owner = d.owner_id === currentUser.id;
          setIsOwner(owner);
          isOwnerRef.current = owner;
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.detail || "Failed to load document.");
      })
      .finally(() => setLoading(false));
  }, [id, currentUser?.email]);

  // ── Save (called by debounced wrapper) ───────────────────────────────────
  const doSave = useCallback(async () => {
    if (!isOwnerRef.current) return;
    setSaveStatus("saving");
    try {
      await updateDocument(
        id,
        titleRef.current,
        contentRef.current,
        currentUser.email
      );
      setSaveStatus("saved");
      // Reset to idle after 1.5 s so "Saved ✓" fades away quietly
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (err) {
      setSaveStatus("idle");
      console.error("Save failed:", err);
      alert("Failed to save: " + (err.response?.data?.detail || err.message));
    }
  }, [id, currentUser?.email]);

  const debouncedSave = useDebouncedCallback(doSave, 600);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTitleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setTitle(val);
      titleRef.current = val;
      debouncedSave();
    },
    [debouncedSave]
  );

  // Editor calls this on every keystroke — we only update the ref,
  // NOT React state, so the header never re-renders while typing.
  const handleContentChange = useCallback(
    (newContent) => {
      contentRef.current = newContent;
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleDelete = useCallback(async () => {
    if (!isOwnerRef.current) return;
    if (window.confirm("Delete this document permanently?")) {
      try {
        await deleteDocument(id, currentUser.email);
        navigate("/");
      } catch {
        alert("Failed to delete document.");
      }
    }
  }, [id, currentUser?.email, navigate]);

  const handleShare = useCallback(() => setShowShare(true), []);
  const handleCloseShare = useCallback(() => setShowShare(false), []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading document…</div>;

  if (errorMsg)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-red-500 text-sm mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );

  if (!doc) return null;

  return (
    <div className="flex flex-col h-screen">
      <DocHeader
        title={title}
        isOwner={isOwner}
        saveStatus={saveStatus}
        onTitleChange={handleTitleChange}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      <div className="flex-1 overflow-hidden">
        <Editor
          content={contentRef.current}
          onChange={handleContentChange}
          readOnly={!isOwner}
        />
      </div>

      {showShare && (
        <ShareModal
          document={doc}
          currentUser={currentUser}
          onClose={handleCloseShare}
          onShared={() => {}}
        />
      )}
    </div>
  );
}
