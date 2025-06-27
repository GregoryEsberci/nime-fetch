const sleep = (duration: number) =>
  new Promise<void>((resolver) => setTimeout(() => resolver(), duration));

export default sleep;
