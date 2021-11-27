import { readdir as fsReadDir } from "fs";
import { promisify } from "util";

const readDir = promisify(fsReadDir);

export default readDir;
