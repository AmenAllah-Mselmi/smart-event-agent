#!/bin/bash

# Google Cloud Deployment Script for Smart Event Agent
# Usage: ./deploy-to-gcp.sh PROJECT_ID [REGION]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-}
REGION=${2:-"us-central1"}
BACKEND_IMAGE_NAME="smart-event-backend"
FRONTEND_IMAGE_NAME="smart-event-frontend"
SERVICE_ACCOUNT_NAME="smart-event-agent"

# Helper functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate inputs
if [ -z "$PROJECT_ID" ]; then
    print_error "PROJECT_ID is required"
    echo "Usage: $0 PROJECT_ID [REGION]"
    exit 1
fi

print_info "Starting deployment to Google Cloud for project: $PROJECT_ID in region: $REGION"

# Step 1: Verify gcloud is installed and authenticated
print_info "Verifying Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud CLI not found. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
print_info "Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com \
    firestore.googleapis.com \
    pubsub.googleapis.com \
    storage-api.googleapis.com \
    compute.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com

# Step 3: Create service account if it doesn't exist
print_info "Setting up service account..."
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com &> /dev/null; then
    print_info "Creating service account: $SERVICE_ACCOUNT_NAME"
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="Smart Event Agent Service Account"
else
    print_info "Service account already exists"
fi

# Grant necessary roles
print_info "Granting IAM roles to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/datastore.user \
    --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/pubsub.editor \
    --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/storage.objectAdmin \
    --quiet 2>/dev/null || true

# Step 4: Deploy Backend to Cloud Run
print_info "Deploying backend to Cloud Run..."
cd backend

# Build and push
print_info "Building Docker image for backend..."
gcloud builds submit \
    --tag gcr.io/${PROJECT_ID}/${BACKEND_IMAGE_NAME}:latest \
    --machine-type=N1_HIGHCPU_8

# Deploy to Cloud Run
print_info "Deploying to Cloud Run..."
BACKEND_URL=$(gcloud run deploy ${BACKEND_IMAGE_NAME} \
    --image gcr.io/${PROJECT_ID}/${BACKEND_IMAGE_NAME}:latest \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 1 \
    --timeout 3600 \
    --set-env-vars PROJECT_ID=${PROJECT_ID} \
    --service-account=${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --allow-unauthenticated \
    --format='value(status.url)' | tr -d '\n')

print_info "Backend deployed successfully!"
print_info "Backend URL: $BACKEND_URL"

cd ..

# Step 5: Deploy Frontend
print_info "Deploying frontend..."
cd frontend

# Install dependencies
print_info "Installing frontend dependencies..."
npm install

# Build Next.js
print_info "Building frontend..."
npm run build

# Create .env.local with backend URL
print_info "Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
EOF

# Option: Deploy frontend to Cloud Run
print_info "Deploying frontend to Cloud Run..."
FRONTEND_URL=$(gcloud run deploy ${FRONTEND_IMAGE_NAME} \
    --source . \
    --platform managed \
    --region $REGION \
    --memory 512Mi \
    --cpu 1 \
    --allow-unauthenticated \
    --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL \
    --format='value(status.url)' | tr -d '\n')

print_info "Frontend deployed successfully!"
print_info "Frontend URL: $FRONTEND_URL"

cd ..

# Step 6: Print summary
echo ""
print_info "==================================="
print_info "Deployment Complete!"
print_info "==================================="
echo ""
echo "Backend Service:"
echo "  URL: $BACKEND_URL"
echo "  Name: $BACKEND_IMAGE_NAME"
echo "  Region: $REGION"
echo ""
echo "Frontend Service:"
echo "  URL: $FRONTEND_URL"
echo "  Name: $FRONTEND_IMAGE_NAME"
echo "  Region: $REGION"
echo ""
echo "Service Account:"
echo "  Email: ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
print_info "Next steps:"
echo "1. Configure your domain (optional):"
echo "   gcloud run services update ${BACKEND_IMAGE_NAME} --set-custom-domains=your-domain.com --region=$REGION"
echo ""
echo "2. View logs:"
echo "   gcloud run logs read ${BACKEND_IMAGE_NAME} --limit=50"
echo ""
echo "3. Set up monitoring in Cloud Console: https://console.cloud.google.com"
echo ""
