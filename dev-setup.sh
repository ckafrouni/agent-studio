#!/bin/bash
set -e

# Start Docker containers
docker compose -f docker-compose.dev.yml up -d

# Wait for DB to initialize
echo "Waiting for database container to initialize..."
sleep 10

# Create S3 bucket
aws s3 mb s3://uploaded-documents --endpoint-url=http://localhost:4566 || true

pnpm run db:push