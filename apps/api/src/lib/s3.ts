import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ServerEnvSchema } from "@wellcore/shared";

const env = ServerEnvSchema.parse(process.env);

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
});

export async function presignPut(opts: {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const cmd = new PutObjectCommand({ Bucket: opts.bucket, Key: opts.key, ContentType: opts.contentType });
  const url = await getSignedUrl(s3, cmd, { expiresIn: opts.expiresIn ?? 600 });
  const publicUrl = `${env.PUBLIC_BASE_URL.replace(/\/$/, "")}/files/${opts.bucket}/${opts.key}`;
  return { url, publicUrl };
}
