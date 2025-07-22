import isValidHttpUrl from '@/utils/is-valid-http-url';

describe('isValidHttpUrl', () => {
  it('should return true for valid HTTP URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBeTrue();
    expect(isValidHttpUrl('https://example.com')).toBeTrue();
  });

  it('should return false for invalid URLs', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBeFalse();
    expect(isValidHttpUrl('example.com')).toBeFalse();
    expect(isValidHttpUrl('not-a-url')).toBeFalse();
    expect(isValidHttpUrl('')).toBeFalse();
  });
});
