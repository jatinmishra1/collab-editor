import { useState } from "react";
import { createDocument, uploadFile } from "../api";

export default function Sidebar({
  documents,
  currentUser,
  onDocumentSelect,
  onDocumentCreate,
  onLogout,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await createDocument(
        newTitle.trim(),
        "<p>Start writing...</p>",
        currentUser.email
      );
      onDocumentCreate(res.data);
      setNewTitle("");
    } catch (err) {
      alert(
        "Failed to create document: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, currentUser.email);
      // BUG FIX: pass the full document object returned by the API
      // (old code passed content:"" which made the doc look blank)
      onDocumentCreate({
        id: res.data.id,
        title: res.data.title,
        content: res.data.content || "",
        owner_id: currentUser.id,
        shares: [],
      });
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    }
  };

  const myDocs = documents.filter((d) => d.owner_id === currentUser.id);
  const sharedDocs = documents.filter((d) => d.owner_id !== currentUser.id);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">CollabEditor</h1>
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
            title="Switch user"
          >
            ⇤
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">{currentUser.email}</p>
      </div>

      {/* Create + Upload */}
      <div className="p-4 border-b space-y-2">
        <input
          type="text"
          placeholder="New document title…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleCreate}
          disabled={!newTitle.trim()}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          + Create
        </button>
        <label className="block w-full bg-gray-100 text-center py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-200">
          {uploading ? "Uploading…" : "📁 Import .txt / .md"}
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-semibold text-gray-400 mb-1 px-2">MY DOCUMENTS</p>
        {myDocs.length === 0 && (
          <p className="text-xs text-gray-300 px-3 py-1">None yet</p>
        )}
        {myDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onDocumentSelect(doc)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 mb-0.5 truncate text-sm"
          >
            📄 {doc.title}
          </button>
        ))}

        <p className="text-xs font-semibold text-gray-400 mt-4 mb-1 px-2">SHARED WITH ME</p>
        {sharedDocs.length === 0 && (
          <p className="text-xs text-gray-300 px-3 py-1">None yet</p>
        )}
        {sharedDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onDocumentSelect(doc)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 mb-0.5 truncate text-sm text-gray-600"
          >
            📄 {doc.title}
            <span className="text-xs text-gray-400 ml-1">(shared)</span>
          </button>
        ))}
      </div>
    </div>
  );
}
