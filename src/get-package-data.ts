import { join as pathJoin } from "path";

import bytesToIec from "./bytes-to-iec";
import getDiskSize from "./get-disk-size";
import getPackagePath from "./get-package-path";
import isChildOfNodeModules from "./is-child-of-node-modules";
import parsePackageJson from "./parse-package-json";
import readFile from "./read-file";

interface PackageData {
  deps: PackageData[];
  dir: string;
  iec: string;
  name: string;
  size: number;
  version: string;
}

const getPackageData = async (
  pkg = "",
  paths: string[] = []
): Promise<PackageData> => {
  const path = pkg ? await getPackagePath(pkg, paths) : process.cwd();
  const dir = pkg ? pathJoin(path, pkg) : path;

  const packageJsonFile = await readFile(pathJoin(dir, "package.json"), "utf8");

  const packageJson = parsePackageJson(packageJsonFile);
  const version = packageJson.version;
  const name = packageJson.name;

  const diskSize = await getDiskSize(dir, {
    cache: isChildOfNodeModules,
    ignore: [".git", "node_modules"],
  });

  const depPaths =
    !pkg || path === paths[0]
      ? [pathJoin(dir, "node_modules")].concat(paths)
      : paths;

  const deps = await Promise.all(
    Object.keys(packageJson?.dependencies || {}).map(async (pkg) => {
      return await getPackageData(pkg, depPaths);
    })
  );

  const size = deps.reduce((total, { size }) => total + size, diskSize);
  const iec = bytesToIec(size);

  return { deps, dir, iec, name, size, version };
};

export default getPackageData;
