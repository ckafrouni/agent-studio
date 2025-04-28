import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

// Ensure required environment variables are set
if (!env.S3_BUCKET_NAME) {
  throw new Error("Missing environment variable: S3_BUCKET_NAME");
}
if (!env.AWS_REGION) {
  throw new Error("Missing environment variable: AWS_REGION");
}

// Configure the S3 client
const s3ClientConfig = {
  region: env.AWS_REGION,
  // Conditionally set endpoint and force path style only if S3_ENDPOINT_URL is defined (for LocalStack/MinIO)
  ...(env.S3_ENDPOINT_URL && {
    endpoint: env.S3_ENDPOINT_URL,
    forcePathStyle: true, // Required for LocalStack/MinIO
    credentials: {
        // Use dummy credentials for localstack if not provided, real credentials will be picked up automatically for AWS
        accessKeyId: env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "test",
    }
  }),
};

export const s3Client = new S3Client(s3ClientConfig);

export const bucketName = env.S3_BUCKET_NAME;
