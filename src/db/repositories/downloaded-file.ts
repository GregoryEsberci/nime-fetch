import Repository from '@/db/base/repository';
import downloadedFileSchema from '@/db/schemas/downloaded-file';

export default class DownloadedFileRepository extends Repository<
  typeof downloadedFileSchema
> {
  override readonly schema = downloadedFileSchema;
}

export const downloadedFileRepository = new DownloadedFileRepository();
