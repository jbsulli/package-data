import getPackageData from "./get-package-data";
import log from "./log";

// const args = process.argv.slice(2);

const run = async () => {
  const packageData = await getPackageData();

  log(packageData);
};

run();
