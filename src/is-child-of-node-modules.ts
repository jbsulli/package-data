import { sep } from "path";

const check = new RegExp(
  `\\${sep}node_modules\\${sep}(?:@[^\\${sep}]+\\${sep}[^\\${sep}]+|[^\\${sep}]+)$`
);

const isChildOfNodeModules = (path: string): boolean => {
  return check.test(path);
};

export default isChildOfNodeModules;
