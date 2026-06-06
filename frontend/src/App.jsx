import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Dashboard from "./pages/Dashboard";
import EditorPage from "./pages/EditorPage";
import UserPicker from "./components/UserPicker";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("collab_user");
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
    }
  }, []);

  const handleSelectUser = useCallback((user) => {
    setCurrentUser(user);
    localStorage.setItem("collab_user", JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("collab_user");
    setCurrentUser(null);
  }, []);

  if (!currentUser) {
    return <UserPicker onSelect={handleSelectUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard currentUser={currentUser} onLogout={handleLogout} />
          }
        />
        <Route
          path="/document/:id"
          element={<EditorPage currentUser={currentUser} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
