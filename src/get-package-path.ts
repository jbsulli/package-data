import isPackagePath from "./is-package-path";

const getPackagePath = async (
  pkg: string,
  paths: string[]
): Promise<string> => {
  for await (const path of paths) {
    if (await isPackagePath(pkg, path)) {
      return path;
    }
  }
  throw new Error(`Package not found: ${pkg}`);
};

export default getPackagePath;
