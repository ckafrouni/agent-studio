#!/bin/bash

# Docker compose
docker compose up -d

# Create S3 bucket
aws s3 mb s3://uploaded-documents --endpoint-url=http://localhost:4566

bun run db:push