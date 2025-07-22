import isObject from '@/utils/is-object';

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBeTrue();
    expect(isObject({ key: 'value' })).toBeTrue();
    expect(isObject([])).toBeTrue();
    expect(isObject([1, 2, 3])).toBeTrue();
    expect(isObject(new Date())).toBeTrue();
    expect(isObject(/regex/)).toBeTrue();
  });

  it('should return false for non-objects', () => {
    expect(isObject(null)).toBeFalse();
    expect(isObject(undefined)).toBeFalse();
    expect(isObject('string')).toBeFalse();
    expect(isObject(123)).toBeFalse();
    expect(isObject(true)).toBeFalse();
    expect(isObject(false)).toBeFalse();
    expect(isObject(() => [])).toBeFalse();
    expect(isObject(Symbol())).toBeFalse();
  });
});
