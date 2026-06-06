import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const getUsers = () => api.get("/users");

export const getDocuments = (userEmail) =>
  api.get(`/documents?user_email=${userEmail}`);

export const createDocument = (title, content, ownerEmail) =>
  api.post("/documents", { title, content, owner_email: ownerEmail });

export const getDocument = (id, userEmail) =>
  api.get(`/documents/${id}?user_email=${userEmail}`);

export const updateDocument = (id, title, content, userEmail) =>
  api.put(`/documents/${id}?user_email=${userEmail}`, { title, content });

export const deleteDocument = (id, userEmail) =>
  api.delete(`/documents/${id}?user_email=${userEmail}`);

export const addShare = (documentId, userEmail) =>
  api.post("/shares", { document_id: documentId, user_email: userEmail });

export const removeShare = (docId, email) =>
  api.delete(`/shares/${docId}/${email}`);

export const uploadFile = (file, ownerEmail) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("owner_email", ownerEmail);
  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
