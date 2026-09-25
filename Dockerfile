# Multi-stage Dockerfile for complete Apple Music Web & FastAPI Platform
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN node ./node_modules/vite/bin/vite.js build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for audio metadata
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY music-server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY music-server/app ./app
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8000
ENV PORT=8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
