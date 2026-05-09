FROM python:3.11-slim

# Install uv
RUN pip install uv

WORKDIR /app

# Copy pyproject.toml
COPY pyproject.toml .

# Install dependencies using uv
RUN uv pip install --system fastapi uvicorn pydantic google-genai google-cloud-firestore google-api-python-client google-auth-httplib2 google-auth-oauthlib sse-starlette pydantic-settings python-dotenv google-cloud-pubsub

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
