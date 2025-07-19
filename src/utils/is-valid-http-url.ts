const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export default isValidHttpUrl;
