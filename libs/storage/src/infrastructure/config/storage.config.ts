import { StorageConfig } from '../../domain/interfaces/storage.interface';

export const createStorageConfig = (
  options: StorageConfig = {},
): StorageConfig => {
  const isTest = process.env.NODE_ENV === 'test';
  return {
    accountId:
      options.accountId ||
      process.env.R2_ACCOUNT_ID ||
      (isTest ? 'mock-account-id' : undefined),
    accessKeyId:
      options.accessKeyId ||
      process.env.R2_ACCESS_KEY_ID ||
      (isTest ? 'mock-access-key-id' : undefined),
    secretAccessKey:
      options.secretAccessKey ||
      process.env.R2_SECRET_ACCESS_KEY ||
      (isTest ? 'mock-secret-access-key' : undefined),
    bucketName:
      options.bucketName ||
      process.env.R2_BUCKET_NAME ||
      (isTest ? 'mock-bucket-name' : undefined),
    region: options.region || process.env.R2_REGION || 'auto',
    endpoint: options.endpoint || process.env.R2_ENDPOINT,
    publicUrl:
      options.publicUrl ||
      process.env.R2_PUBLIC_URL ||
      (isTest ? 'https://mock-r2-url.com' : undefined),
  };
};
