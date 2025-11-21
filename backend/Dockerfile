# ------------ Base Image ------------
FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ------------ Install System Dependencies ------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ------------ Create App Directory ------------
WORKDIR /app

# ------------ Install Python Dependencies ------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ------------ Copy App Source Code ------------
COPY . .

# ------------ Expose Port ------------
EXPOSE 8000

# ------------ Run Server ------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
