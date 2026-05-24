#!/bin/bash
# ================================================
# Multilingual OCR System - Setup Script
# ================================================

echo "🚀 Setting up Multilingual OCR System..."

# ---------- BACKEND SETUP ----------
echo ""
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo ""
echo "🔤 Installing Tesseract OCR..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get update -q
    sudo apt-get install -y tesseract-ocr \
        tesseract-ocr-hin \
        tesseract-ocr-kan \
        tesseract-ocr-tam \
        tesseract-ocr-tel \
        tesseract-ocr-ben \
        tesseract-ocr-guj \
        tesseract-ocr-pan \
        tesseract-ocr-mal \
        tesseract-ocr-mar
    echo "✅ Tesseract installed (Linux)"

elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew install tesseract
    brew install tesseract-lang
    echo "✅ Tesseract installed (macOS)"

elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "⚠️  Windows detected."
    echo "Please download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki"
    echo "Install it, then add to PATH."
fi

cd ..

# ---------- FRONTEND SETUP ----------
echo ""
echo "🎨 Installing Frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "================================================"
echo "  HOW TO RUN"
echo "================================================"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && python app.py"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "3. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "================================================"
