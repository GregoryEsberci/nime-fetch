import { DownloadedFileInsert } from '@/database/schemas/downloaded-file';

export const buildDownloadedFile = (
  overrides: Partial<DownloadedFileInsert> = {},
): DownloadedFileInsert => ({
  path: '/downloads/test-file.mp4',
  downloadUrl: 'https://example.com/video/test-file.mp4',
  ...overrides,
});
