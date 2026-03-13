import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 client configuration.
 * R2 is S3-compatible, so we use the AWS S3 SDK with a custom endpoint.
 *
 * Required environment variables:
 * - R2_ACCOUNT_ID: Your Cloudflare account ID
 * - R2_ACCESS_KEY_ID: R2 API token access key
 * - R2_SECRET_ACCESS_KEY: R2 API token secret key
 * - R2_BUCKET_NAME: Name of your R2 bucket
 * - R2_PUBLIC_URL: Public URL for the bucket (custom domain or r2.dev URL)
 */

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "clarity-scans";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

/**
 * Lazily create the S3 client so the module doesn't throw at import time
 * when environment variables are missing (e.g. during next build).
 */
let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_client) return _client;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials are not configured. " +
        "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your environment. " +
        "See the Cloudflare R2 setup guide for details."
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _client;
}

/**
 * Build the public URL for an object stored in R2.
 * Uses the configured R2_PUBLIC_URL (custom domain or r2.dev subdomain).
 */
export function getR2PublicUrl(key: string): string {
  if (!R2_PUBLIC_URL) {
    throw new Error(
      "R2_PUBLIC_URL is not configured. " +
        "Set it to your R2 bucket's public URL (e.g. https://media.yourdomain.com or https://<bucket>.<account-id>.r2.dev)."
    );
  }
  const base = R2_PUBLIC_URL.endsWith("/") ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
  return `${base}/${key}`;
}
