# Google Cloud Deployment Guide

This guide will help you deploy the Smart Event Agent project to Google Cloud.

## Prerequisites

1. **Google Cloud Account** - Create one at https://cloud.google.com
2. **Google Cloud CLI** - Install from https://cloud.google.com/sdk/docs/install
3. **Docker** - Required for building container images
4. **Project Setup**:
   ```bash
   gcloud init
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Architecture Overview

- **Backend**: Cloud Run (FastAPI containerized application)
- **Frontend**: Cloud Storage + Cloud CDN or Cloud Run
- **Database**: Cloud Firestore (already configured in code)
- **Messaging**: Cloud Pub/Sub (already configured in code)
- **APIs**: Gmail API, Maps API (configured in services)

## Pre-Deployment Steps

### 1. Set Up GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Create project (if needed)
gcloud projects create $PROJECT_ID

# Set as default
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Set Up Service Account & Authentication

```bash
# Create service account for the application
gcloud iam service-accounts create smart-event-agent \
    --display-name="Smart Event Agent Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/datastore.user

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/pubsub.editor

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/storage.objectAdmin

# Create and download key
gcloud iam service-accounts keys create ~/smart-event-agent-key.json \
    --iam-account=smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com

export GOOGLE_APPLICATION_CREDENTIALS=~/smart-event-agent-key.json
```

### 3. Configure Environment Variables

Create a `.env.gcp` file in the backend directory:

```env
# Google Cloud
PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/google/key.json

# API Keys (set these securely via Secret Manager)
GMAIL_API_KEY=your_gmail_api_key
MAPS_API_KEY=your_maps_api_key
GENAI_API_KEY=your_genai_api_key

# Service Configuration
FIRESTORE_DATABASE=default
PUBSUB_TOPIC=events
PUBSUB_SUBSCRIPTION=events-sub
```

## Deployment Options

### Option 1: Automated Deployment (Recommended)

Run the provided deployment script:

```bash
cd smart-event-agent
./scripts/deploy-to-gcp.sh YOUR_PROJECT_ID us-central1
```

### Option 2: Manual Deployment

#### A. Deploy Backend to Cloud Run

```bash
cd backend

# Build and push container image
gcloud builds submit --tag gcr.io/$PROJECT_ID/smart-event-backend:latest

# Deploy to Cloud Run
gcloud run deploy smart-event-backend \
    --image gcr.io/$PROJECT_ID/smart-event-backend:latest \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 1 \
    --timeout 3600 \
    --set-env-vars PROJECT_ID=$PROJECT_ID \
    --service-account=smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --allow-unauthenticated
```

#### B. Deploy Frontend

**Option B1: Cloud Storage + CDN**

```bash
cd frontend

# Build Next.js app
npm run build

# Create storage bucket
gsutil mb -l $REGION gs://$PROJECT_ID-frontend

# Upload built files
gsutil -m cp -r out/* gs://$PROJECT_ID-frontend/

# Set CORS for API calls
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$PROJECT_ID-frontend

# Set index and 404 pages
gsutil web set -m index.html -e 404.html gs://$PROJECT_ID-frontend
```

**Option B2: Cloud Run**

```bash
cd frontend

# Create Dockerfile for frontend (if not exists)
gcloud run deploy smart-event-frontend \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL
```

#### C. Update Frontend API URL

After backend deployment, update frontend environment:

```bash
# Update frontend .env.local with backend URL
NEXT_PUBLIC_API_URL=https://smart-event-backend-XXXXX.run.app
```

## Post-Deployment

### 1. Set Up Custom Domain (Optional)

```bash
# For Cloud Run
gcloud run services update smart-event-backend \
    --update-custom-domains=your-domain.com \
    --region=$REGION
```

### 2. Configure SSL/TLS

Google Cloud Run automatically provides SSL certificates. For custom domains, use Cloud Armor or Cloud CDN.

### 3. Set Up Monitoring & Logging

```bash
# View logs
gcloud run logs read smart-event-backend --limit=50

# Set up alerts (via Cloud Console)
# Monitor CPU, Memory, and Error Rate
```

### 4. Configure Secrets Manager (Recommended)

Instead of env files, use Google Cloud Secret Manager:

```bash
# Create secrets
echo -n "your_gmail_api_key" | gcloud secrets create gmail-api-key --data-file=-
echo -n "your_maps_api_key" | gcloud secrets create maps-api-key --data-file=-
echo -n "your_genai_api_key" | gcloud secrets create genai-api-key --data-file=-

# Grant service account access
gcloud secrets add-iam-policy-binding gmail-api-key \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
```

## Troubleshooting

### Backend won't start
- Check logs: `gcloud run logs read smart-event-backend`
- Verify environment variables are set
- Check service account permissions

### Frontend can't reach backend
- Verify CORS settings in backend
- Check Network connectivity from Cloud Run
- Ensure backend URL is correct

### Firebase/Firestore errors
- Verify Firestore database exists
- Check service account has Datastore permissions
- Verify Google Application Credentials are set

## Cleanup

To delete all resources:

```bash
# Delete Cloud Run services
gcloud run services delete smart-event-backend --region=$REGION
gcloud run services delete smart-event-frontend --region=$REGION

# Delete storage bucket
gsutil -m rm -r gs://$PROJECT_ID-frontend

# Delete service account
gcloud iam service-accounts delete smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com

# Delete project (caution!)
gcloud projects delete $PROJECT_ID
```

## Cost Optimization

- **Cloud Run**: Use 256MB memory for frontend, 2GB for backend
- **Auto-scaling**: Set min instances to 0 to reduce idle costs
- **Cloud Storage**: Use Lifecycle policies to delete old versions
- **Firestore**: Use on-demand pricing if unpredictable usage

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Next.js Deployment on Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs)
