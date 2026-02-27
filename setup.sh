#!/bin/bash

echo ""
echo "🛡️  DeepGuard Pro — Setup Script"
echo "=================================="
echo ""

# Backend setup
echo "📦 Step 1: Setting up Python backend..."
cd backend
pip3 install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
mkdir -p uploads
echo "✅ Backend ready!"
cd ..

# Frontend setup
echo ""
echo "⚛️  Step 2: Setting up React frontend..."
cd frontend
npm install
echo "✅ Frontend ready!"
cd ..

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "========================================="
echo "  HOW TO RUN:"
echo "========================================="
echo ""
echo "  Terminal 1 — Backend:"
echo "  cd backend && python3 app.py"
echo ""
echo "  Terminal 2 — Frontend:"
echo "  cd frontend && npm start"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo "  Chrome Extension:"
echo "  1. Open Chrome → chrome://extensions"
echo "  2. Enable Developer Mode (top right)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select the 'extension' folder"
echo "  5. Right-click any image → Check with DeepGuard!"
echo "========================================="
echo ""
