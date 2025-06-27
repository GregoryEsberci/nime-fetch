const sanitizeFileName = (input: string) =>
  input
    .replace(/[/\\?%*:|"<>]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/-+/g, '-') // collapse multiple -
    .replace(/^-+|-+$/g, ''); // trim - from start/end

export default sanitizeFileName;
