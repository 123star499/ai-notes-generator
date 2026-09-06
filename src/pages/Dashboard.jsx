import React, { useState, useEffect, useContext } from "react";
import ReactMarkdown from "react-markdown";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Generator States
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [format, setFormat] = useState("bullet-points");
  const [loading, setLoading] = useState(false);

  // App States
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const suggestions = [
    "Operating System Process Scheduling",
    "Database Normalization (1NF to BCNF)",
    "Object-Oriented Programming in Java",
    "TCP/IP vs OSI Model Architecture"
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchNotes();
  }, [user]);

  // Stop speech if switching notes
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [activeNote]);

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
      // Sends combined topic, difficulty, and format to backend
      const res = await API.post("/notes/generate", { 
        topic: `${topic.trim()} (Target Level: ${difficulty})`, 
        format 
      });

      if (res.data.success) {
        const newNote = res.data.note;
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
        setTopic("");
        setStatusMsg({ type: "success", text: "Study note successfully generated & saved!" });
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

  const handleDownloadTxt = () => {
    if (!activeNote?.content) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Browser-native Clean Print / Save to PDF
  const handlePrintPDF = () => {
    if (!activeNote) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeNote.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #212529; }
            h1 { font-size: 24px; border-bottom: 2px solid #0d6efd; padding-bottom: 8px; margin-bottom: 20px; }
            pre { background: #f8f9fa; padding: 12px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h1>${activeNote.title}</h1>
          <div>${document.getElementById("active-note-markdown")?.innerHTML || activeNote.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Text-To-Speech Player
  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const cleanText = activeNote.content.replace(/[#*`_-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const wordCount = activeNote?.content ? activeNote.content.trim().split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 180);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-lg-5 py-4 bg-body-tertiary min-vh-100">
      {/* Header Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 bg-primary text-white rounded-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="fw-bold mb-1">AI Study Workspace 🚀</h3>
                <p className="mb-0 text-white-50">
                  Generate comprehensive academic notes with AI and auto-sync them across sessions.
                </p>
              </div>

              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn btn-light btn-sm px-3 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2"
                >
                  {theme === "light" ? <span>🌙 Dark Mode</span> : <span>☀️ Light Mode</span>}
                </button>

                <span className="badge bg-white text-primary px-3 py-2 rounded-pill fs-6 shadow-sm">
                  Saved Notes: {notes.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert alert-${statusMsg.type} alert-dismissible fade show rounded-3 shadow-sm`} role="alert">
          {statusMsg.text}
          <button type="button" className="btn-close" onClick={() => setStatusMsg({ type: "", text: "" })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Generator Form & Saved List */}
        <div className="col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-body">
            <h5 className="fw-bold mb-3">✨ Generate New Note</h5>
            <form onSubmit={handleGenerate}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Topic or Question</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 fs-6"
                  placeholder="e.g. Distributed Operating Systems"
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

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small text-muted">Difficulty Level</label>
                  <select
                    className="form-select rounded-3"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Beginner">Beginner (Foundational)</option>
                    <option value="Intermediate">Intermediate (Undergrad)</option>
                    <option value="Advanced">Advanced (Deep Dive)</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold small text-muted">Note Format</label>
                  <select
                    className="form-select rounded-3"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    disabled={loading}
                  >
                    <option value="bullet-points">Bullet Points</option>
                    <option value="detailed-summary">Detailed Explanation</option>
                    <option value="exam-prep">Exam QA & Key Formulas</option>
                    <option value="mcq">Practice MCQs with Answers</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm"
                disabled={loading || !topic.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Synthesizing with AI...
                  </>
                ) : (
                  "Generate & Save Note"
                )}
              </button>
            </form>
          </div>

          {/* Notes Drawer */}
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-body">
            <h6 className="fw-bold mb-2 px-2">📚 Your Saved Notes</h6>

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
                    className={`card mb-2 p-3 border rounded-3 cursor-pointer ${
                      activeNote?.id === n.id ? "bg-primary text-white shadow-sm border-primary" : "bg-body"
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
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-body d-flex flex-column">
            {activeNote ? (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom gap-2">
                  <div>
                    <h4 className="fw-bold mb-1">{activeNote.title}</h4>
                    <span className="text-muted small">
                      📖 {wordCount} words • ~{readTime} min read
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {/* Audio Reader */}
                    <button
                      onClick={toggleSpeech}
                      className={`btn btn-sm rounded-pill px-3 ${
                        isSpeaking ? "btn-warning text-dark" : "btn-outline-info"
                      }`}
                    >
                      {isSpeaking ? "⏹ Stop Audio" : "🔊 Listen"}
                    </button>

                    <button
                      onClick={handleCopy}
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    >
                      {copySuccess ? "✓ Copied" : "📋 Copy"}
                    </button>

                    <button
                      onClick={handlePrintPDF}
                      className="btn btn-outline-success btn-sm rounded-pill px-3"
                    >
                      🖨️ PDF / Print
                    </button>

                    <button
                      onClick={handleDownloadTxt}
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      💾 .txt
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
                <div 
                  id="active-note-markdown" 
                  className="flex-grow-1 overflow-auto pe-2" 
                  style={{ lineHeight: "1.75" }}
                >
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="text-center my-auto py-5">
                <div className="fs-1 mb-2">📝</div>
                <h5 className="fw-bold text-secondary">No Note Selected</h5>
                <p className="text-muted small">
                  Select an item from the left drawer or generate a brand new note.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}