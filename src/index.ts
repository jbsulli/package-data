import { join as pathJoin } from "path";

import parseYarnLockfile from "./parseYarnLockfile";
import readFile from "./readFile";

// const args = process.argv.slice(2);
const cwd = process.cwd();

const run = async () => {
  const yarnLockfile = await readFile(pathJoin(cwd, "yarn.lock"), "utf8");

  console.log(parseYarnLockfile(yarnLockfile));
};

run();
