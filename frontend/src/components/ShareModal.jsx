import { useState, useEffect } from "react";
import { addShare, removeShare, getUsers } from "../api";

export default function ShareModal({ document, currentUser, onClose, onShared }) {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [sharedWith, setSharedWith] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsers().then((res) => setUsers(res.data));
    // BUG FIX: document.shares is now included in the API response
    if (document?.shares) {
      setSharedWith(document.shares.map((s) => s.user_email));
    }
  }, [document]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    // BUG FIX: prevent owner from sharing with themselves
    if (email === currentUser.email) {
      alert("You are already the owner of this document.");
      return;
    }
    const userExists = users.some((u) => u.email === email);
    if (!userExists) {
      alert("User not found. Available users: alice@example.com, bob@example.com, carol@example.com");
      return;
    }
    if (sharedWith.includes(email)) {
      alert("Already shared with this user.");
      return;
    }
    setLoading(true);
    try {
      await addShare(document.id, email);
      setSharedWith([...sharedWith, email]);
      onShared();
      setEmail("");
    } catch (err) {
      alert("Failed to share: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (emailToRemove) => {
    setLoading(true);
    try {
      await removeShare(document.id, emailToRemove);
      setSharedWith(sharedWith.filter((e) => e !== emailToRemove));
      onShared();
    } catch (err) {
      alert("Failed to remove: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  // Available users to share with (exclude owner and already-shared)
  const available = users.filter(
    (u) => u.email !== currentUser.email && !sharedWith.includes(u.email)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-1">Share Document</h2>
        <p className="text-sm text-gray-500 mb-4 truncate">"{document.title}"</p>

        <div className="flex gap-2 mb-3">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleAdd}
            disabled={loading || !email.trim()}
            className="bg-indigo-600 text-white px-4 rounded-lg text-sm disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Quick-pick available users */}
        {available.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-4">
            {available.map((u) => (
              <button
                key={u.email}
                onClick={() => setEmail(u.email)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
              >
                {u.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">People with access:</p>
          {sharedWith.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Not shared with anyone yet</p>
          ) : (
            sharedWith.map((e) => (
              <div key={e} className="flex justify-between items-center py-1.5 border-b last:border-0">
                <span className="text-sm">{e}</span>
                <button
                  onClick={() => handleRemove(e)}
                  disabled={loading}
                  className="text-red-500 text-xs hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}
