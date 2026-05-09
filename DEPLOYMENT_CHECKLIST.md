# Deployment Configuration Checklist

## Before You Deploy

### 1. Google Cloud Account Setup
- [ ] Create Google Cloud account at https://cloud.google.com
- [ ] Create a new GCP project
- [ ] Enable billing on the project
- [ ] Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install

### 2. Local Environment Setup
- [ ] Install Docker: https://www.docker.com/products/docker-desktop
- [ ] Install Node.js 18+: https://nodejs.org
- [ ] Install Python 3.11+: https://www.python.org
- [ ] Configure gcloud: `gcloud init` and `gcloud auth login`

### 3. GCP Configuration
```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  pubsub.googleapis.com \
  storage-api.googleapis.com \
  compute.googleapis.com \
  containerregistry.googleapis.com
```

### 4. Service Account Setup
```bash
# Create service account
gcloud iam service-accounts create smart-event-agent \
    --display-name="Smart Event Agent Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/datastore.user

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/pubsub.editor

# Create key
gcloud iam service-accounts keys create ~/smart-event-agent-key.json \
    --iam-account=smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com

export GOOGLE_APPLICATION_CREDENTIALS=~/smart-event-agent-key.json
```

### 5. Environment Configuration
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Fill in API keys and credentials
- [ ] Test locally: `cd backend && python main.py`
- [ ] Test frontend build: `cd frontend && npm run build`

### 6. Firestore Setup
```bash
# Create Firestore database
gcloud firestore databases create --region=$REGION
```

### 7. Secret Management (Optional but Recommended)
```bash
# Store sensitive data in Secret Manager instead of .env files
echo -n "YOUR_GMAIL_API_KEY" | gcloud secrets create gmail-api-key --data-file=-
echo -n "YOUR_MAPS_API_KEY" | gcloud secrets create maps-api-key --data-file=-
echo -n "YOUR_GENAI_API_KEY" | gcloud secrets create genai-api-key --data-file=-

# Grant service account access
gcloud secrets add-iam-policy-binding gmail-api-key \
    --member=serviceAccount:smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
```

## Deployment Steps

### Quick Deploy (Recommended)
```bash
./scripts/deploy-to-gcp.sh your-project-id us-central1
```

### Manual Deploy

#### Step 1: Build and Push Backend
```bash
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/smart-event-backend:latest
cd ..
```

#### Step 2: Deploy Backend to Cloud Run
```bash
gcloud run deploy smart-event-backend \
  --image gcr.io/$PROJECT_ID/smart-event-backend:latest \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 1 \
  --allow-unauthenticated \
  --service-account=smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com
```

#### Step 3: Get Backend URL
```bash
gcloud run services describe smart-event-backend \
  --region us-central1 \
  --format 'value(status.url)'
```

#### Step 4: Deploy Frontend
```bash
cd frontend
npm install
npm run build

gcloud run deploy smart-event-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars NEXT_PUBLIC_API_URL=<BACKEND_URL>
cd ..
```

## Verification

### Check Services
```bash
# List deployed services
gcloud run services list

# Get service details
gcloud run services describe smart-event-backend

# View logs
gcloud run logs read smart-event-backend --limit=50
```

### Health Checks
```bash
# Test backend
curl https://smart-event-backend-XXXXX.run.app/

# Test frontend
curl https://smart-event-frontend-XXXXX.run.app/
```

## After Deployment

### 1. Configure Monitoring
- [ ] Set up Cloud Monitoring dashboard
- [ ] Create alerts for errors and high latency
- [ ] Enable Cloud Logging

### 2. Set Up Custom Domain (Optional)
- [ ] Reserve static IP
- [ ] Configure DNS records
- [ ] Set custom domain on Cloud Run services

### 3. Configure CORS
Update `backend/main.py` with your frontend URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Set Up CI/CD (Optional)
- [ ] Configure GitHub Actions with `.github/workflows/deploy-gcp.yml`
- [ ] Set up Workload Identity Federation for secure authentication
- [ ] Test automatic deployments

## Troubleshooting

### Container won't start
```bash
gcloud run logs read smart-event-backend --limit=100
```

### Firestore permission denied
```bash
# Verify service account has access
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:smart-event-agent@*"
```

### CORS errors
- Update allowed origins in `backend/main.py`
- Ensure frontend URL matches exactly
- Redeploy backend after changes

### Out of memory
- Increase Cloud Run memory: `--memory 4Gi`
- Optimize application code
- Use cloud profiler to identify issues

## Cost Tracking

Monitor costs in [Google Cloud Console](https://console.cloud.google.com/billing):
- [ ] Set budget alerts
- [ ] Review committed use discounts
- [ ] Enable billing export to BigQuery

## Cleanup

```bash
# Delete services
gcloud run services delete smart-event-backend
gcloud run services delete smart-event-frontend

# Delete storage buckets
gsutil -m rm -r gs://$PROJECT_ID-frontend

# Delete service account
gcloud iam service-accounts delete smart-event-agent@$PROJECT_ID.iam.gserviceaccount.com

# Delete project
gcloud projects delete $PROJECT_ID
```
