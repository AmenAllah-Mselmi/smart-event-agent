# Google Cloud Deployment - Quick Reference

## Essential Setup Commands

```bash
# Initialize and authenticate
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable APIs (one-time)
gcloud services enable run.googleapis.com firestore.googleapis.com pubsub.googleapis.com

# Create service account (one-time)
gcloud iam service-accounts create smart-event-agent \
  --display-name="Smart Event Agent Service Account"
```

## Deployment Commands

### One-Command Deploy (Recommended)
```bash
./scripts/deploy-to-gcp.sh YOUR_PROJECT_ID us-central1
```

### Manual Backend Deploy
```bash
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/smart-event-backend:latest
gcloud run deploy smart-event-backend \
  --image gcr.io/$PROJECT_ID/smart-event-backend:latest \
  --platform managed --region us-central1 --memory 2Gi --allow-unauthenticated
cd ..
```

### Manual Frontend Deploy
```bash
cd frontend
npm install && npm run build
gcloud run deploy smart-event-frontend \
  --source . --platform managed --region us-central1 --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=BACKEND_URL_HERE
cd ..
```

## Monitoring & Management

```bash
# List all services
gcloud run services list

# View logs (real-time)
gcloud run logs read smart-event-backend

# Get service URL
gcloud run services describe smart-event-backend --format 'value(status.url)'

# Update service environment
gcloud run services update smart-event-backend \
  --set-env-vars KEY1=value1,KEY2=value2 --region us-central1

# Scale settings
gcloud run services update smart-event-backend \
  --min-instances 1 --max-instances 100 --region us-central1

# Delete service
gcloud run services delete smart-event-backend --region us-central1
```

## Troubleshooting Commands

```bash
# Test connectivity
curl https://smart-event-backend-XXXXX.run.app/

# Check service status
gcloud run services describe smart-event-backend --format yaml

# View detailed logs (last 100 lines)
gcloud run logs read smart-event-backend --limit 100

# Check IAM permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" --filter="bindings.members:smart-event-agent@*"

# Verify Firestore access
gcloud firestore databases list

# Check image in registry
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

## Secret Management

```bash
# Create secret
echo -n "secret_value" | gcloud secrets create secret-name --data-file=-

# List secrets
gcloud secrets list

# Grant access to service account
gcloud secrets add-iam-policy-binding secret-name \
  --member=serviceAccount:smart-event-agent@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Delete secret
gcloud secrets delete secret-name
```

## Cost Management

```bash
# View billing account
gcloud billing accounts list

# Set budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Smart Event Budget" \
  --budget-amount=100
```

## CI/CD (GitHub Actions)

```bash
# Set up Workload Identity (authenticate GitHub to GCP)
gcloud iam workload-identity-pools create "github" \
  --project=PROJECT_ID \
  --location=global \
  --display-name="GitHub"

# Create service account for CI/CD
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Grant permissions to deploy
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.admin
```

## Common Issues

### Port Error
**Problem**: "Port 8000 not responding"  
**Solution**: Cloud Run uses port 8080 (check Dockerfile)

### Service Account Error
**Problem**: "Permission denied" errors  
**Solution**: 
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:smart-event-agent@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/datastore.user
```

### Frontend Can't Reach Backend
**Problem**: CORS errors or 503 service unavailable  
**Solution**: Update `NEXT_PUBLIC_API_URL` with correct backend URL

### Out of Quota
**Problem**: "quota exceeded" error  
**Solution**: Check available regions/resources
```bash
gcloud compute regions list
gcloud compute resource-quotas list
```

## Cleanup Commands

```bash
# Delete all services
gcloud run services delete smart-event-backend --region us-central1 --quiet
gcloud run services delete smart-event-frontend --region us-central1 --quiet

# Delete containers
gcloud container images delete gcr.io/$PROJECT_ID/smart-event-backend --quiet

# Delete entire project (careful!)
gcloud projects delete $PROJECT_ID

# Revoke credentials
gcloud auth application-default print-access-token | xargs \
  gcloud auth application-default revoke
```

## Useful URLs

- **Cloud Console**: https://console.cloud.google.com
- **Cloud Run**: https://console.cloud.google.com/run
- **Firestore**: https://console.cloud.google.com/firestore
- **Logs**: https://console.cloud.google.com/logs
- **Billing**: https://console.cloud.google.com/billing
- **IAM & Admin**: https://console.cloud.google.com/iam-admin

## Documentation

- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Firestore Docs](https://cloud.google.com/firestore/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

**Pro Tip**: Save this file locally and refer to it while deploying!
