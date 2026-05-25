FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-kan \
    tesseract-ocr-tam \
    tesseract-ocr-tel \
    tesseract-ocr-mar \
    tesseract-ocr-ben \
    tesseract-ocr-guj \
    tesseract-ocr-pan \
    tesseract-ocr-mal \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
