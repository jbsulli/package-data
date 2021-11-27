import getDiskSize from "./get-disk-size";

interface RecursiveHandler {
  (path: string, recursiveHandler?: RecursiveHandler): Promise<number>;
}

const cache: Record<string, number | Promise<number>> = {};

const memCacheDiskSize = async (
  path: string,
  shouldCache?: (path: string) => boolean
): Promise<number> => {
  if (path in cache) return cache[path];

  const run = async (path: string, recursiveHandler?: RecursiveHandler) => {
    if (path in cache) return cache[path];

    const sizePromise = getDiskSize(path, recursiveHandler);

    if (!shouldCache || !shouldCache(path)) {
      return sizePromise;
    }

    sizePromise.then((size) => {
      cache[path] = size;
      return size;
    });

    cache[path] = sizePromise;

    return sizePromise;
  };

  return run(path, run);
};

export default memCacheDiskSize;
