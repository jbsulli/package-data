interface YarnLockfilePackage {
  dependencies?: string[];
  integrity: string;
  optionalDependencies?: string[];
  resolved: string;
  version: string;
}

const requiredKeys: Array<keyof YarnLockfilePackage> = [
  "integrity",
  "resolved",
  "version",
];
const optionalKeys: Array<keyof YarnLockfilePackage> = [
  "dependencies",
  "optionalDependencies",
];
const stringKeys: Array<keyof YarnLockfilePackage> = requiredKeys;
const allKeys: string[] = requiredKeys.concat(optionalKeys);

interface YarnLockfileMap {
  [key: string]: YarnLockfileMap | string;
}

const lineReturns = /\r\n|\n/g;
const comment = /^#.*/;
const blankLine = /^ *$/;

function assertObject(
  value: unknown,
  name = "Value"
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function assertIsPackage(
  value: unknown,
  packageName: string
): asserts value is YarnLockfilePackage {
  assertObject(value);

  const unexpectedKeys = Object.keys(value).filter(
    (key) => !allKeys.includes(key)
  );

  if (unexpectedKeys.length) {
    throw new Error(
      `${packageName}: Unexpected key${
        unexpectedKeys.length > 1 ? "s" : ""
      }: ${unexpectedKeys.join(", ")}`
    );
  }

  const missingKeys = requiredKeys.filter((key) => !(key in value));

  if (unexpectedKeys.length) {
    throw new Error(
      `${packageName}: Missing package properties${
        missingKeys.length > 1 ? "s" : ""
      }: ${missingKeys.join(", ")}`
    );
  }

  const nonStringKeys = stringKeys.filter(
    (key) => typeof value[key] !== "string"
  );

  if (nonStringKeys.length) {
    throw new Error(
      `${packageName}: propert${
        nonStringKeys.length > 1 ? "ies must be strings" : "y must be a string"
      }: ${nonStringKeys.join(", ")}`
    );
  }

  if ("dependencies" in value && value.dependencies) {
    assertObject(value.dependencies, `${packageName}: dependencies`);

    const badDependencies = Object.values(value.dependencies).filter(
      (value) => typeof value !== "string"
    );

    if (badDependencies.length > 0) {
      throw new Error(
        `${packageName}: dependenc${
          badDependencies.length > 1
            ? "ies must be strings"
            : "y must be a string"
        }: ${badDependencies.join(", ")}`
      );
    }
  }

  if ("optionalDependencies" in value && value.optionalDependencies) {
    assertObject(
      value.optionalDependencies,
      `${packageName}: optionalDependencies`
    );

    const badDependencies = Object.values(value.optionalDependencies).filter(
      (value) => typeof value !== "string"
    );

    if (badDependencies.length > 0) {
      throw new Error(
        `${packageName}: optionalDependenc${
          badDependencies.length > 1
            ? "ies must be strings"
            : "y must be a string"
        }: ${badDependencies.join(", ")}`
      );
    }
  }
}

const parseQuoted = (
  quote: string,
  str: string
): { i: number; value: string } => {
  for (let i = 1; i < str.length; i++) {
    if (str[i] === quote) {
      return { i: i + 1, value: str.substring(1, i) };
    }
  }
  throw new Error(`Unexpected end of line while parsing string: ${str}`);
};

const parseUnquotedMapKey = (str: string): { i: number; value: string } => {
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === ":" || char === " " || char === ",") {
      return { i, value: str.substr(0, i) };
    }
  }
  throw new Error(`Unexpected end of line while parsing key: ${str}`);
};

const parseMapValue = (
  lines: string[],
  i: number,
  str: string,
  indent: string
): { i: number; value: string | YarnLockfileMap } => {
  if (str === ":") {
    return parseMap(lines, i + 1, indent + "  ");
  }

  if (str.charAt(0) !== " ") {
    throw new Error(`Unexpected character while parsing value: ${str}`);
  }

  str = str.substr(1);

  const value =
    str.charAt(0) === '"'
      ? parseQuoted('"', str)
      : { i: str.length, value: str };

  if (value.i !== str.length) {
    throw new Error(
      `Unexpected characters after parsing value: ${str.substr(i)}`
    );
  }

  return { i, value: value.value };
};

const parseMap = (
  lines: string[],
  i: number,
  indent = ""
): { i: number; value: YarnLockfileMap } => {
  const map: YarnLockfileMap = {};

  for (; i < lines.length; i++) {
    const line = lines[i];

    if (blankLine.test(line)) {
      break;
    }

    const indentValue = line.substr(0, indent.length);

    if (indentValue !== indent) {
      i--;
      break;
    }

    let remaining = line.substr(indent.length);

    const key =
      remaining[0] === '"'
        ? parseQuoted('"', remaining)
        : parseUnquotedMapKey(remaining);

    if (key.value in map) {
      throw new Error(`Key already exists in map: ${key}`);
    }

    const keys = [key.value];

    remaining = remaining.substr(key.i);

    while (remaining.substr(0, 2) === ", ") {
      remaining = remaining.substr(2);

      const key =
        remaining[0] === '"'
          ? parseQuoted('"', remaining)
          : parseUnquotedMapKey(remaining);

      if (key.value in map) {
        throw new Error(`Key already exists in map: ${key}`);
      }

      keys.push(key.value);

      remaining = remaining.substr(key.i);
    }

    const value = parseMapValue(lines, i, remaining, indent);
    i = value.i;

    keys.forEach((key) => (map[key] = value.value));
  }

  return { i, value: map };
};

const parseYarnLockfile = (
  yarnLockfile: string
): Record<string, YarnLockfilePackage> => {
  const lines = yarnLockfile.split(lineReturns);
  const packages: Record<string, YarnLockfilePackage> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (comment.test(line) || blankLine.test(line)) {
      continue;
    }

    const map = parseMap(lines, i);
    i = map.i;

    Object.entries(map.value).forEach(([pkg, data]) => {
      assertIsPackage(data, pkg);

      packages[pkg] = data;
    });
  }

  return packages;
};

export default parseYarnLockfile;
