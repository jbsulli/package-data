interface PackageJson {
  bin?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  license?: string;
  name: string;
  scripts?: Record<string, string>;
  version: string;
}

const parsePackageJson = (packageJson: string): PackageJson => {
  return JSON.parse(packageJson);
};

export default parsePackageJson;
