import { useEffect, useState } from "react";
import { getUsers } from "../api";

export default function UserPicker({ onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading users...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">📄 CollabEditor</h1>
        <p className="text-gray-600 mb-6">Select a user to continue</p>
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              {user.name} ({user.email})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
