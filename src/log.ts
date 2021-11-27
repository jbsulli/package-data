import { inspect } from "util";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]): void =>
  console.log(
    ...args.map((v) =>
      typeof v === "string" ? v : inspect(v, false, null, true)
    )
  );

export default log;
