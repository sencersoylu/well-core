// Pre-populate process.env with safe placeholder values so ServerEnvSchema.parse()
// succeeds during tests without requiring a real .env file.
const defaults: Record<string, string> = {
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: "postgresql://wellcore:wellcore@localhost:5434/wellcore",
  BETTER_AUTH_SECRET: "test-secret-must-be-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3000",
  PUBLIC_BASE_URL: "http://localhost:3000",
  APPLE_CLIENT_ID: "com.wellcore.app.test",
  APPLE_TEAM_ID: "TESTTEAMID",
  APPLE_KEY_ID: "TESTKEYID0",
  APPLE_PRIVATE_KEY:
    "-----BEGIN PRIVATE KEY-----\\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg\\n-----END PRIVATE KEY-----\\n",
  S3_ENDPOINT: "http://localhost:9000",
  S3_REGION: "us-east-1",
  S3_ACCESS_KEY: "minioadmin",
  S3_SECRET_KEY: "minioadmin",
  S3_BUCKET: "wellcore-test",
  S3_AVATARS_BUCKET: "wellcore-test",
  S3_SESSION_MEDIA_BUCKET: "wellcore-test",
};

for (const [k, v] of Object.entries(defaults)) {
  if (process.env[k] === undefined) process.env[k] = v;
}
