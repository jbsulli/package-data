import { join as pathJoin } from "path";

import readDir from "./read-dir";
import stat from "./stat";

interface DiskSizeOptions {
  cache?: boolean | ((path: string) => boolean);
  ignore?: string[];
}

const cache: Record<string, number | Promise<number>> = {};

const _getDiskSize = async (path: string, options: DiskSizeOptions) => {
  const stats = await stat(path);
  const { size } = stats;

  if (!stats.isDirectory()) {
    return size;
  }

  const dirItems = await readDir(path);
  const items = options.ignore
    ? dirItems.filter((item) => !options.ignore?.includes(item))
    : dirItems;

  const sizes = await Promise.all(
    items.map((item) => getDiskSize(pathJoin(path, item), options))
  );

  return sizes.reduce((total, size) => total + size, size);
};

const getDiskSize = async (
  path: string,
  options: DiskSizeOptions = {}
): Promise<number> => {
  if (path in cache) return cache[path];

  const shouldCache =
    options.cache &&
    (typeof options.cache !== "function" || options.cache(path));

  const sizePromise = _getDiskSize(path, options);

  if (shouldCache) {
    cache[path] = sizePromise.then((size) => {
      cache[path] = size;
      return size;
    });
  }

  return await sizePromise;
};

export default getDiskSize;
