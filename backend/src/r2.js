import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const config = () => ({
  accountId: process.env.R2_ACCOUNT_ID,
  bucket: process.env.R2_BUCKET,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/+$/, ''),
});

export function isR2Configured() {
  const { accountId, bucket, accessKeyId, secretAccessKey, publicUrl } = config();
  return Boolean(accountId && bucket && accessKeyId && secretAccessKey && publicUrl);
}

function client() {
  const { accountId, accessKeyId, secretAccessKey } = config();
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadToR2({ key, body, contentType }) {
  const { bucket, publicUrl } = config();
  if (!isR2Configured()) throw new Error('R2 storage is not configured');
  await client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${publicUrl}/${key}`;
}

export async function deleteR2Prefix(prefix) {
  const { bucket } = config();
  if (!isR2Configured()) return;
  const listed = await client().send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  const objects = (listed.Contents || []).filter((item) => item.Key).map((item) => ({ Key: item.Key }));
  if (objects.length) {
    await client().send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } }));
  }
}