import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../api";
import Sidebar from "../components/Sidebar";

export default function Dashboard({ currentUser, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const res = await getDocuments(currentUser.email);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentUser.email]); // Only re‑load when email changes

  const handleSelectDocument = (doc) => {
    navigate(`/document/${doc.id}`);
  };

  const handleDocumentCreate = (newDoc) => {
    setDocuments((prev) => [...prev, newDoc]);
    navigate(`/document/${newDoc.id}`);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        documents={documents}
        currentUser={currentUser}
        onDocumentSelect={handleSelectDocument}
        onDocumentCreate={handleDocumentCreate}
        onLogout={onLogout}
      />
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-lg">Select a document from the sidebar</p>
          <p className="text-sm">or create a new one to start editing</p>
        </div>
      </div>
    </div>
  );
}
