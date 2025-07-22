import sanitizeFileName from '@/utils/sanitize-file-name';

describe('sanitizeFileName', () => {
  it('should remove invalid characters', () => {
    // eslint-disable-next-line prettier/prettier
    const invalidCharacters = ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'].join('');

    expect(sanitizeFileName(`file${invalidCharacters}name.txt`)).toBe(
      'filename.txt',
    );
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeFileName('my file name.txt')).toBe('my-file-name.txt');
    expect(sanitizeFileName('  multiple   spaces  ')).toBe('multiple-spaces');
  });

  it('should collapse multiple hyphens', () => {
    expect(sanitizeFileName('file---name.txt')).toBe('file-name.txt');
    expect(sanitizeFileName('file--name--test.txt')).toBe('file-name-test.txt');
  });

  it('should trim hyphens from start and end', () => {
    expect(sanitizeFileName('-filename.txt')).toBe('filename.txt');
    expect(sanitizeFileName('filename.txt-')).toBe('filename.txt');
    expect(sanitizeFileName('---filename.txt---')).toBe('filename.txt');
  });

  it('should handle empty string', () => {
    expect(sanitizeFileName('')).toBe('');
  });

  it('should handle complex cases', () => {
    expect(sanitizeFileName('  my/file\\name?.txt  ')).toBe('myfilename.txt');
    expect(sanitizeFileName('---  test   file***.txt  ---')).toBe(
      'test-file.txt',
    );
  });
});
