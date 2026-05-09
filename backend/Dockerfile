FROM python:3.11-slim

# Install system dependencies needed by the image health check
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

WORKDIR /app

# Copy pyproject.toml
COPY pyproject.toml .

# Install dependencies using uv
RUN uv pip install --system fastapi uvicorn pydantic google-genai google-cloud-firestore google-api-python-client google-auth-httplib2 google-auth-oauthlib sse-starlette pydantic-settings python-dotenv google-cloud-pubsub

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run uses PORT environment variable, defaults to 8080)
EXPOSE 8080

# Set environment for Cloud Run
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
