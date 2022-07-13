export PROJECT_ID=test-f2c9f
export REGION=asia-south1
export CONNECTION_NAME=test-f2c9f:asia-south1:practice-db
export APP_NAME=hackathon-eua

docker build -t $APP_NAME .

docker tag $APP_NAME gcr.io/$PROJECT_ID/$APP_NAME

docker push gcr.io/$PROJECT_ID/$APP_NAME

gcloud run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances $CONNECTION_NAME \
  --project $PROJECT_ID