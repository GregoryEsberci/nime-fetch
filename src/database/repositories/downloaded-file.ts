import Repository from '@/database/repositories/base';
import downloadedFileSchema from '@/database/schemas/downloaded-file';

export default class DownloadedFileRepository extends Repository<
  typeof downloadedFileSchema
> {
  override readonly schema = downloadedFileSchema;
}

export const downloadedFileRepository = new DownloadedFileRepository();
