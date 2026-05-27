import { StorageConfig } from '../../domain/interfaces/storage.interface';

export const createStorageConfig = (
  options: StorageConfig = {},
): StorageConfig => {
  return {
    accountId: options.accountId || process.env.R2_ACCOUNT_ID,
    accessKeyId: options.accessKeyId || process.env.R2_ACCESS_KEY_ID,
    secretAccessKey:
      options.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY,
    bucketName: options.bucketName || process.env.R2_BUCKET_NAME,
    region: options.region || process.env.R2_REGION || 'auto',
    endpoint: options.endpoint || process.env.R2_ENDPOINT,
    publicUrl: options.publicUrl || process.env.R2_PUBLIC_URL,
  };
};
