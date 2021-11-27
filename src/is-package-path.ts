import { access as fsAccess } from "fs";
import { join as pathJoin } from "path";
import { promisify } from "util";

const access = promisify(fsAccess);

const isPackagePath = async (pkg: string, path: string): Promise<boolean> => {
  try {
    await access(pathJoin(path, pkg, "package.json"));
    return true;
  } catch (err) {
    return false;
  }
};

export default isPackagePath;
