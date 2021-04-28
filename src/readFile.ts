import { readFile as fsReadFile } from "fs";
import { promisify } from "util";

const readFile = promisify(fsReadFile);

export default readFile;
