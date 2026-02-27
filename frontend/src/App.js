import { useState, useCallback } from "react";
import "./App.css";

const API = "http://localhost:5001";

function App() {
  const [page, setPage] = useState("home");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUrl = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/analyze-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setPreview(urlInput);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      setHistory([]);
    }
  };

  const clearHistory = async () => {
    await fetch(`${API}/history`, { method: "DELETE" });
    setHistory([]);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setUrlInput("");
  };

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => { setPage("home"); reset(); }}>
          🛡️ <span>DeepGuard <b>Pro</b></span>
        </div>
        <div className="nav-links">
          <button className={page === "home" ? "active" : ""} onClick={() => { setPage("home"); reset(); }}>🏠 Home</button>
          <button className={page === "analyze" ? "active" : ""} onClick={() => { setPage("analyze"); reset(); }}>🔍 Analyze</button>
          <button className={page === "history" ? "active" : ""} onClick={() => { setPage("history"); loadHistory(); }}>📋 History</button>
          <button className={page === "about" ? "active" : ""} onClick={() => setPage("about")}>ℹ️ About</button>
        </div>
      </nav>

      {/* HOME PAGE */}
      {page === "home" && (
        <div className="page home-page">
          <div className="hero">
            <div className="hero-badge">🛡️ AI-Powered Detection</div>
            <h1>Detect Deepfakes<br /><span className="gradient-text">Instantly & Accurately</span></h1>
            <p className="hero-sub">Upload any image and our AI will tell you if it's real or AI-generated in seconds. Also works as a Chrome Extension!</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => setPage("analyze")}>🔍 Start Analyzing</button>
              <button className="btn-outline" onClick={() => setPage("about")}>Learn How It Works</button>
            </div>
          </div>

          <div className="stats-row">
            {[["⚡", "< 3 sec", "Detection Speed"], ["🎯", "94%+", "AI Accuracy"], ["🌐", "Any Image", "Web or Upload"], ["🔌", "Chrome", "Extension Ready"]].map(([icon, val, label]) => (
              <div className="stat-card" key={label}>
                <span className="stat-icon">{icon}</span>
                <span className="stat-val">{val}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="how-section">
            <h2>How It Works</h2>
            <div className="steps-row">
              {[
                ["01", "📤", "Upload Image", "Drag & drop or select any image file from your device"],
                ["02", "🤖", "AI Analyzes", "HuggingFace model scans pixel patterns & facial anomalies"],
                ["03", "⚡", "Get Result", "Instant REAL or FAKE verdict with confidence percentage"],
                ["04", "📄", "Save Report", "History saved — view all past analyses anytime"],
              ].map(([num, icon, title, desc]) => (
                <div className="step-card" key={num}>
                  <div className="step-num">{num}</div>
                  <div className="step-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYZE PAGE */}
      {page === "analyze" && (
        <div className="page analyze-page">
          <h1 className="page-title">🔍 Analyze Media</h1>
          <p className="page-sub">Upload an image or paste a URL to detect deepfakes</p>

          <div className="analyze-grid">
            {/* Upload Box */}
            <div className="upload-section">
              <div
                className={`drop-zone ${drag ? "drag-over" : ""} ${preview ? "has-preview" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => !preview && document.getElementById("fileInput").click()}
              >
                {preview ? (
                  <div className="preview-wrap">
                    <img src={preview} alt="preview" className="preview-img" />
                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); reset(); }}>✕ Remove</button>
                  </div>
                ) : (
                  <div className="drop-content">
                    <div className="drop-icon">📁</div>
                    <p><b>Drag & drop image here</b></p>
                    <p className="drop-sub">or click to browse</p>
                    <span className="drop-types">PNG, JPG, WEBP supported</span>
                  </div>
                )}
              </div>
              <input id="fileInput" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

              {/* URL Input */}
              <div className="url-row">
                <span className="url-label">Or paste image URL:</span>
                <div className="url-input-wrap">
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="url-input"
                  />
                  <button className="btn-primary small" onClick={analyzeUrl} disabled={loading || !urlInput.trim()}>
                    {loading ? "..." : "Scan URL"}
                  </button>
                </div>
              </div>

              <button
                className="btn-primary analyze-btn"
                onClick={analyze}
                disabled={loading || !file}
              >
                {loading ? (
                  <span className="loading-text"><span className="spinner" />  Analyzing with AI...</span>
                ) : "🔍 Analyze Image"}
              </button>
            </div>

            {/* Result Box */}
            <div className="result-section">
              {!result && !loading && !error && (
                <div className="result-empty">
                  <div className="empty-icon">🛡️</div>
                  <p>Upload an image to see the analysis result here</p>
                </div>
              )}

              {loading && (
                <div className="result-loading">
                  <div className="pulse-ring" />
                  <p>🤖 AI is analyzing the image...</p>
                  <p className="loading-sub">Scanning pixel patterns & facial features</p>
                </div>
              )}

              {error && (
                <div className="result-error">
                  <div className="error-icon">⚠️</div>
                  <h3>Analysis Failed</h3>
                  <p>{error}</p>
                  <button className="btn-outline small" onClick={reset}>Try Again</button>
                </div>
              )}

              {result && !loading && (
                <div className={`result-card ${result.result === "FAKE" ? "fake" : "real"}`}>
                  <div className="result-verdict">
                    <span className="verdict-icon">{result.result === "FAKE" ? "❌" : "✅"}</span>
                    <span className="verdict-text">{result.result}</span>
                  </div>

                  <div className="confidence-section">
                    <div className="conf-label">
                      <span>Confidence Score</span>
                      <span className="conf-pct">{result.confidence}%</span>
                    </div>
                    <div className="conf-bar-bg">
                      <div
                        className={`conf-bar-fill ${result.result === "FAKE" ? "fake" : "real"}`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="result-meta">
                    <div className="meta-item">
                      <span className="meta-label">File</span>
                      <span className="meta-val">{result.filename}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Analyzed At</span>
                      <span className="meta-val">{result.timestamp}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Model Label</span>
                      <span className="meta-val">{result.label}</span>
                    </div>
                  </div>

                  <div className="all-scores">
                    <p className="scores-title">All Class Scores</p>
                    {result.all_scores?.map((s) => (
                      <div key={s.label} className="score-row">
                        <span>{s.label}</span>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${s.score}%` }} />
                        </div>
                        <span>{s.score}%</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn-outline small" onClick={reset} style={{ marginTop: "1rem", width: "100%" }}>
                    🔄 Analyze Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY PAGE */}
      {page === "history" && (
        <div className="page history-page">
          <div className="history-header">
            <h1 className="page-title">📋 Analysis History</h1>
            {history.length > 0 && (
              <button className="btn-outline small danger" onClick={clearHistory}>🗑️ Clear All</button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">📂</div>
              <p>No analyses yet. Start by analyzing an image!</p>
              <button className="btn-primary" onClick={() => setPage("analyze")}>Go Analyze</button>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((item) => (
                <div key={item.id} className={`history-card ${item.result === "FAKE" ? "fake" : "real"}`}>
                  <div className="hcard-top">
                    <span className={`hcard-badge ${item.result === "FAKE" ? "fake" : "real"}`}>
                      {item.result === "FAKE" ? "❌ FAKE" : "✅ REAL"}
                    </span>
                    <span className="hcard-time">{item.timestamp}</span>
                  </div>
                  <p className="hcard-file">📄 {item.filename}</p>
                  <div className="conf-label" style={{ marginTop: "0.5rem" }}>
                    <span>Confidence</span>
                    <span className="conf-pct">{item.confidence}%</span>
                  </div>
                  <div className="conf-bar-bg">
                    <div
                      className={`conf-bar-fill ${item.result === "FAKE" ? "fake" : "real"}`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABOUT PAGE */}
      {page === "about" && (
        <div className="page about-page">
          <h1 className="page-title">ℹ️ About DeepGuard Pro</h1>
          <div className="about-grid">
            <div className="about-card purple">
              <h2>🎯 What is DeepGuard Pro?</h2>
              <p>DeepGuard Pro is an AI-powered web platform + Chrome Extension that detects deepfake images instantly. It uses a pre-trained HuggingFace model to analyze facial patterns and pixel-level anomalies that humans can't see.</p>
            </div>
            <div className="about-card coral">
              <h2>⚙️ How does the AI work?</h2>
              <p>The model is trained on thousands of real and fake images. It looks for inconsistencies in pixel blending, unnatural facial features, lighting mismatches, and compression artifacts that are signatures of AI-generated faces.</p>
            </div>
            <div className="about-card green">
              <h2>🔌 Browser Extension</h2>
              <p>Load the extension from the <b>/extension</b> folder in Chrome. Right-click any image on any website and click "Check with DeepGuard" to instantly analyze it without leaving the page.</p>
            </div>
            <div className="about-card yellow">
              <h2>🛠️ Tech Stack</h2>
              <p><b>Frontend:</b> React.js<br /><b>Backend:</b> Python + Flask<br /><b>AI Model:</b> HuggingFace Transformers<br /><b>Extension:</b> Chrome Manifest V3</p>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>🛡️ DeepGuard Pro — Built for Cybersecurity & Defense Track | 24-Hour Hackathon</p>
      </footer>
    </div>
  );
}

export default App;
