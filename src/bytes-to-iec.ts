const order = ["B", "KiB", "MiB", "GiB", "TiB"];
const div = [1, 1024, 1048576, 1073741824, 1099511627776];
const max = order.length - 1;

const bytesToIec = (bytes: number): string => {
  if (bytes === 0) return `0 ${order[0]}`;

  // eslint-disable-next-line no-var
  for (var i = 0; bytes > div[i + 1] && i < max; i++);

  return `${(bytes / div[i]).toFixed(1)} ${order[i]}`;
};

export default bytesToIec;
