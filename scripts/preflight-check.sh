#!/bin/bash

# Quick pre-flight checks before deploying to Google Cloud
# Run this script to verify your setup is complete

set -e

echo "🔍 Pre-flight Deployment Checks"
echo "================================"
echo ""

# Check 1: Google Cloud CLI
echo "✓ Checking Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
GCLOUD_VERSION=$(gcloud --version | head -n1)
echo "  $GCLOUD_VERSION"

# Check 2: Docker
echo "✓ Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    echo "   Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo "  $DOCKER_VERSION"

# Check 3: GCP Authentication
echo "✓ Checking GCP authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Not authenticated with GCP"
    echo "   Run: gcloud auth login"
    exit 1
fi
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo "  Authenticated as: $ACTIVE_ACCOUNT"

# Check 4: GCP Project
echo "✓ Checking GCP project..."
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project configured"
    echo "   Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo "  Project ID: $PROJECT_ID"

# Check 5: Node.js and npm
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo "   Install from: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "  $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo "  npm $NPM_VERSION"

# Check 6: Python
echo "✓ Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo "  $PYTHON_VERSION"

# Check 7: Backend dependencies
echo "✓ Checking backend structure..."
if [ ! -f "backend/pyproject.toml" ]; then
    echo "❌ backend/pyproject.toml not found"
    exit 1
fi
if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ backend/Dockerfile not found"
    exit 1
fi
echo "  Found pyproject.toml and Dockerfile"

# Check 8: Frontend dependencies
echo "✓ Checking frontend structure..."
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found"
    exit 1
fi
if [ ! -f "frontend/Dockerfile" ]; then
    echo "❌ frontend/Dockerfile not found"
    exit 1
fi
echo "  Found package.json and Dockerfile"

# Check 9: Required APIs enabled
echo "✓ Checking required Google Cloud APIs..."
APIS_TO_CHECK=("run.googleapis.com" "firestore.googleapis.com" "pubsub.googleapis.com")
for api in "${APIS_TO_CHECK[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "  ✓ $api"
    else
        echo "  ⚠ $api (not enabled, will enable during deployment)"
    fi
done

echo ""
echo "✅ Pre-flight checks passed!"
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/deploy-to-gcp.sh $PROJECT_ID"
echo "2. Or for manual deployment, see: DEPLOYMENT_GUIDE.md"
echo ""
