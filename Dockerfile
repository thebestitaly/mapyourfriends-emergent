# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Set backend URL to empty string for relative paths (same origin)
ENV REACT_APP_BACKEND_URL=""
RUN npm run build

# Stage 2: Serve with Backend
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build to static directory
COPY --from=frontend-build /app/frontend/build ./static

# Expose port (Railway sets PORT env var)
ENV PORT=8000
EXPOSE $PORT

# Run the application
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port $PORT"]
