import React, { useState, useEffect, useContext } from "react";
import ReactMarkdown from "react-markdown";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("bullet-points");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const suggestions = [
    "Operating System Process Scheduling",
    "Database Normalization (1NF to BCNF)",
    "Object-Oriented Programming Principles",
    "TCP/IP vs OSI Model Breakdown"
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      if (res.data.success) {
        setNotes(res.data.notes);
        if (res.data.notes.length > 0 && !activeNote) {
          setActiveNote(res.data.notes[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await API.post("/notes/generate", { topic, format });
      if (res.data.success) {
        const newNote = res.data.note;
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
        setTopic("");
        setStatusMsg({ type: "success", text: "Note generated & saved to your database!" });
      }
    } catch (err) {
      setStatusMsg({
        type: "danger",
        text: err.response?.data?.message || "Generation failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      const updatedNotes = notes.filter((n) => n.id !== id);
      setNotes(updatedNotes);
      if (activeNote?.id === id) {
        setActiveNote(updatedNotes[0] || null);
      }
      setStatusMsg({ type: "success", text: "Note deleted successfully." });
    } catch (err) {
      setStatusMsg({ type: "danger", text: "Failed to delete note." });
    }
  };

  const handleCopy = () => {
    if (!activeNote?.content) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote?.content) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-lg-5 py-4 bg-light min-vh-100">
      {/* Header Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 bg-primary text-white rounded-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="fw-bold mb-1">AI Study Workspace 🚀</h3>
                <p className="mb-0 text-white-50">
                  Generate structured revision notes with Gemini AI and auto-save them to your account.
                </p>
              </div>
              <span className="badge bg-white text-primary px-3 py-2 rounded-pill fs-6">
                Saved Notes: {notes.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert alert-${statusMsg.type} alert-dismissible fade show rounded-3`} role="alert">
          {statusMsg.text}
          <button type="button" className="btn-close" onClick={() => setStatusMsg({ type: "", text: "" })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark">✨ Generate New Note</h5>
            <form onSubmit={handleGenerate}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Topic or Question</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 fs-6"
                  placeholder="e.g. Distributed Systems Architecture"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {/* Suggestions */}
              <div className="mb-3">
                <span className="d-block small text-muted mb-2">Quick Ideas:</span>
                <div className="d-flex flex-wrap gap-1">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => setTopic(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small text-muted">Format Style</label>
                <select
                  className="form-select rounded-3"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={loading}
                >
                  <option value="bullet-points">Bullet Points (Quick Revision)</option>
                  <option value="detailed-summary">Detailed Deep Dive</option>
                  <option value="exam-prep">Exam Cheat-Sheet & Definitions</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm"
                disabled={loading || !topic.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Generating with Gemini...
                  </>
                ) : (
                  "Generate & Save Note"
                )}
              </button>
            </form>
          </div>

          {/* Notes Drawer */}
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-2 px-2 text-dark">📚 Your Saved Notes</h6>

            <div className="mb-3 px-1">
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3"
                placeholder="🔍 Search saved notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-auto pe-1" style={{ maxHeight: "380px" }}>
              {filteredNotes.length === 0 ? (
                <p className="text-muted small text-center my-4">
                  {notes.length === 0 ? "No notes created yet. Generate one above!" : "No matching notes found."}
                </p>
              ) : (
                filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNote(n)}
                    className={`card mb-2 p-3 border-0 rounded-3 cursor-pointer ${
                      activeNote?.id === n.id ? "bg-primary text-white shadow-sm" : "bg-white border"
                    }`}
                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="fw-semibold mb-1 text-truncate" style={{ maxWidth: "80%" }}>
                        {n.title}
                      </h6>
                      <button
                        className={`btn btn-sm p-0 ${activeNote?.id === n.id ? "text-white" : "text-danger"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </div>
                    <small className={activeNote?.id === n.id ? "text-white-50" : "text-muted"}>
                      {new Date(n.created_at || Date.now()).toLocaleDateString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Markdown Active Note Display */}
        <div className="col-lg-7 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column">
            {activeNote ? (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom gap-2">
                  <h4 className="fw-bold text-dark mb-0">{activeNote.title}</h4>
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    >
                      {copySuccess ? "✓ Copied" : "📋 Copy Content"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      💾 Download (.txt)
                    </button>
                    <button
                      onClick={() => handleDelete(activeNote.id)}
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Markdown Render Area */}
                <div className="flex-grow-1 overflow-auto pe-2 text-secondary" style={{ lineHeight: "1.7" }}>
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="text-center my-auto py-5">
                <div className="fs-1 mb-2">📝</div>
                <h5 className="fw-bold text-secondary">No Note Selected</h5>
                <p className="text-muted small">
                  Select a saved note from the sidebar or generate a new one on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}