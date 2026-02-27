const API = "http://localhost:5001";

const show = (id) => {
  ["idle-state", "loading-state", "result-state", "error-state"].forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
};

const analyze = async (url) => {
  show("loading-state");
  try {
    const res = await fetch(`${API}/analyze-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Show result
    const isFake = data.result === "FAKE";
    document.getElementById("result-img").src = url;
    document.getElementById("verdict-emoji").textContent = isFake ? "❌" : "✅";
    document.getElementById("verdict-text").textContent = data.result;
    document.getElementById("conf-pct").textContent = data.confidence + "%";

    const box = document.getElementById("verdict-box");
    box.className = "verdict-box " + (isFake ? "fake" : "real");

    const bar = document.getElementById("conf-bar");
    bar.className = "bar-fill " + (isFake ? "fake" : "real");
    setTimeout(() => { bar.style.width = data.confidence + "%"; }, 100);

    show("result-state");
    chrome.storage.local.remove(["imageUrl", "status"]);
  } catch (e) {
    document.getElementById("error-msg").textContent =
      e.message.includes("Failed to fetch")
        ? "❌ Can't connect. Make sure the backend is running at localhost:5000"
        : e.message;
    show("error-state");
  }
};

// On popup open
chrome.storage.local.get(["imageUrl", "status"], (data) => {
  if (data.imageUrl && data.status === "pending") {
    analyze(data.imageUrl);
  } else {
    show("idle-state");
  }
});

// Buttons
document.getElementById("analyze-again")?.addEventListener("click", () => show("idle-state"));
document.getElementById("open-webapp")?.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" });
});
document.getElementById("retry-btn")?.addEventListener("click", () => {
  chrome.storage.local.get(["imageUrl"], (data) => {
    if (data.imageUrl) analyze(data.imageUrl);
    else show("idle-state");
  });
});
