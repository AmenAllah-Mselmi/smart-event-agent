@echo off
REM Google Cloud Deployment Script for Windows
REM Usage: deploy-to-gcp.bat PROJECT_ID [REGION]

setlocal enabledelayedexpansion

REM Colors for output
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

REM Configuration
set "PROJECT_ID=%1"
set "REGION=%2"
if "!REGION!"=="" set "REGION=us-central1"

set "BACKEND_IMAGE_NAME=smart-event-backend"
set "FRONTEND_IMAGE_NAME=smart-event-frontend"
set "SERVICE_ACCOUNT_NAME=smart-event-agent"

REM Validate inputs
if "!PROJECT_ID!"=="" (
    echo ERROR: PROJECT_ID is required
    echo Usage: %0 PROJECT_ID [REGION]
    exit /b 1
)

echo [INFO] Starting deployment to Google Cloud
echo [INFO] Project: !PROJECT_ID!
echo [INFO] Region: !REGION!

REM Step 1: Check gcloud is installed
where gcloud >nul 2>nul
if !errorlevel! neq 0 (
    echo ERROR: Google Cloud CLI not found
    echo Please install it from https://cloud.google.com/sdk/docs/install
    exit /b 1
)

echo [INFO] Setting project...
call gcloud config set project !PROJECT_ID!

REM Step 2: Enable APIs
echo [INFO] Enabling Google Cloud APIs...
call gcloud services enable run.googleapis.com ^
    firestore.googleapis.com ^
    pubsub.googleapis.com ^
    storage-api.googleapis.com ^
    compute.googleapis.com ^
    containerregistry.googleapis.com ^
    artifactregistry.googleapis.com

REM Step 3: Create service account
echo [INFO] Setting up service account...
gcloud iam service-accounts describe %SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com >nul 2>&1
if !errorlevel! neq 0 (
    echo [INFO] Creating service account...
    call gcloud iam service-accounts create %SERVICE_ACCOUNT_NAME% ^
        --display-name="Smart Event Agent Service Account"
)

REM Step 4: Deploy Backend
echo [INFO] Deploying backend...
cd backend

echo [INFO] Building Docker image...
call gcloud builds submit ^
    --tag gcr.io/!PROJECT_ID!/!BACKEND_IMAGE_NAME!:latest ^
    --machine-type=N1_HIGHCPU_8

echo [INFO] Deploying to Cloud Run...
for /f "delims=" %%A in ('gcloud run deploy !BACKEND_IMAGE_NAME! ^
    --image gcr.io/!PROJECT_ID!/!BACKEND_IMAGE_NAME!:latest ^
    --platform managed ^
    --region !REGION! ^
    --memory 2Gi ^
    --cpu 1 ^
    --timeout 3600 ^
    --set-env-vars PROJECT_ID=!PROJECT_ID! ^
    --service-account=!SERVICE_ACCOUNT_NAME!@!PROJECT_ID!.iam.gserviceaccount.com ^
    --allow-unauthenticated ^
    --format="value(status.url)"') do (
    set "BACKEND_URL=%%A"
)

echo [INFO] Backend deployed: !BACKEND_URL!

cd ..

REM Step 5: Deploy Frontend
echo [INFO] Deploying frontend...
cd frontend

echo [INFO] Installing dependencies...
call npm install

echo [INFO] Building frontend...
call npm run build

echo [INFO] Creating environment configuration...
(
    echo NEXT_PUBLIC_API_URL=!BACKEND_URL!
) > .env.local

echo [INFO] Deploying to Cloud Run...
for /f "delims=" %%A in ('gcloud run deploy !FRONTEND_IMAGE_NAME! ^
    --source . ^
    --platform managed ^
    --region !REGION! ^
    --memory 512Mi ^
    --cpu 1 ^
    --allow-unauthenticated ^
    --set-env-vars NEXT_PUBLIC_API_URL=!BACKEND_URL! ^
    --format="value(status.url)"') do (
    set "FRONTEND_URL=%%A"
)

echo [INFO] Frontend deployed: !FRONTEND_URL!

cd ..

REM Step 6: Summary
echo.
echo ===================================
echo Deployment Complete!
echo ===================================
echo.
echo Backend Service:
echo   URL: !BACKEND_URL!
echo   Name: !BACKEND_IMAGE_NAME!
echo   Region: !REGION!
echo.
echo Frontend Service:
echo   URL: !FRONTEND_URL!
echo   Name: !FRONTEND_IMAGE_NAME!
echo   Region: !REGION!
echo.
echo Next steps:
echo 1. Test your deployment:
echo    - Backend: !BACKEND_URL!
echo    - Frontend: !FRONTEND_URL!
echo.
echo 2. View logs:
echo    gcloud run logs read !BACKEND_IMAGE_NAME! --limit=50
echo.
echo 3. Check Cloud Console: https://console.cloud.google.com
echo.

endlocal
