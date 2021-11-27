import { stat as fsStat } from "fs";
import { promisify } from "util";

const stat = promisify(fsStat);

export default stat;
