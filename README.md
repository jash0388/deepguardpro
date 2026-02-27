# 🛡️ DeepGuard Pro

AI-Powered Deepfake Detection Platform + Chrome Extension

---

## 📁 Project Structure

```
deepguard/
├── backend/
│   ├── app.py           ← Flask API server
│   ├── detector.py      ← AI detection logic
│   ├── requirements.txt ← Python dependencies
│   └── uploads/         ← Temp file storage
├── frontend/
│   ├── src/
│   │   ├── App.js       ← Main React app
│   │   └── App.css      ← Styling
│   └── package.json
├── extension/
│   ├── manifest.json    ← Chrome extension config
│   ├── background.js    ← Context menu logic
│   ├── popup.html       ← Extension popup UI
│   └── popup.js         ← Extension logic
└── setup.sh             ← One-click setup
```

---

## 🚀 Quick Start

### Step 1 — Install Dependencies

**Backend:**
```bash
cd backend
pip3 install flask flask-cors transformers torch torchvision Pillow requests
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### Step 2 — Run the App

Open **2 separate terminals:**

**Terminal 1 (Backend):**
```bash
cd backend
python3 app.py
```
→ Runs at http://localhost:5000

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
→ Opens http://localhost:3000

---

### Step 3 — Load Chrome Extension

1. Open Chrome → go to `chrome://extensions`
2. Toggle **Developer Mode** ON (top right)
3. Click **"Load unpacked"**
4. Select the `extension/` folder
5. Extension is now active!

**To use:** Right-click any image on any website → "🛡️ Check with DeepGuard"

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if server is running |
| POST | `/analyze` | Analyze uploaded image file |
| POST | `/analyze-url` | Analyze image from URL |
| GET | `/history` | Get analysis history |
| DELETE | `/history` | Clear history |

---

## 🤖 AI Model

- **Model:** `dima806/deepfake_vs_real_image_detection`
- **Source:** HuggingFace (free, no API key needed!)
- **First run:** Downloads ~400MB model automatically
- **Accuracy:** 94%+ on standard deepfake datasets

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + CSS |
| Backend | Python 3 + Flask |
| AI Model | HuggingFace Transformers |
| Extension | Chrome Manifest V3 |

---

## ⚠️ Troubleshooting

**pip install fails:**
```bash
pip3 install flask flask-cors transformers torch Pillow requests --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Model download slow:** First run downloads ~400MB. Wait for "✅ AI Model loaded!" message.

**Extension can't connect:** Make sure backend is running first at localhost:5000.
