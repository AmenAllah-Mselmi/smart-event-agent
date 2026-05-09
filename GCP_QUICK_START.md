# Google Cloud Quick Start

Get your Smart Event Agent deployed to Google Cloud in minutes!

## Option 1: Quick Deploy (Automated)

```bash
# 1. Install Google Cloud CLI (if not already installed)
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Initialize gcloud
gcloud init
gcloud auth login

# 3. Navigate to project root
cd /path/to/smart-event-agent

# 4. Make deployment script executable
chmod +x scripts/deploy-to-gcp.sh

# 5. Run deployment
./scripts/deploy-to-gcp.sh YOUR_PROJECT_ID us-central1
```

The script will:
- Enable all required APIs
- Create a service account
- Build and deploy backend to Cloud Run
- Build and deploy frontend to Cloud Run
- Return your live URLs

## Option 2: Manual Deploy (Step-by-Step)

### Prerequisites Setup

```bash
# Set environment variables
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Authenticate
gcloud auth login
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com firestore.googleapis.com pubsub.googleapis.com storage-api.googleapis.com
```

### Deploy Backend

```bash
cd backend

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/smart-event-backend:latest

# Deploy to Cloud Run
gcloud run deploy smart-event-backend \
  --image gcr.io/$PROJECT_ID/smart-event-backend:latest \
  --platform managed \
  --region $REGION \
  --memory 2Gi \
  --allow-unauthenticated
```

Note the backend URL returned.

### Deploy Frontend

```bash
cd frontend

# Install and build
npm install
npm run build

# Deploy to Cloud Run
gcloud run deploy smart-event-frontend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=<BACKEND_URL>
```

## Verify Deployment

```bash
# Check backend is running
curl https://smart-event-backend-XXXXX.run.app

# Check frontend
# Open https://smart-event-frontend-XXXXX.run.app in browser

# View logs
gcloud run logs read smart-event-backend --limit=50
```

## Next Steps

1. **Set up monitoring**: View in [Cloud Console](https://console.cloud.google.com)
2. **Configure custom domain** (optional): Add your domain to Cloud Run
3. **Set up API keys**: Use Secret Manager for sensitive data
4. **Enable billing alerts**: Avoid unexpected charges

## Cost Estimate

- **Cloud Run**: ~$0.00003 per request (always-free tier covers 2M requests/month)
- **Firestore**: ~$0.06 per 100K read operations (free tier: 50K/day)
- **Pub/Sub**: Free tier covers most use cases
- **Storage**: Minimal cost for static files

## Troubleshooting

**Services not starting?**
```bash
gcloud run logs read smart-event-backend --limit=100
```

**Backend can't reach Firestore?**
```bash
# Verify Firestore is created
gcloud firestore databases list
```

**Frontend can't reach backend?**
- Check CORS in backend/main.py
- Verify backend URL in frontend .env

## Clean Up (Avoid Charges)

```bash
# Delete services
gcloud run services delete smart-event-backend --region=$REGION
gcloud run services delete smart-event-frontend --region=$REGION

# Or delete entire project
gcloud projects delete $PROJECT_ID
```

## Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment details and troubleshooting.
