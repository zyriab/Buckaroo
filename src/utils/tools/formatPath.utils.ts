import normalize from 'normalize-path';

/** Mostly used to make sure a path doesn't start with a leading '/' */
export default function formatPath(
  path: string,
  { stripTrailing = true, stripLeading = true } = {}
) {
  const str: string | string[] = Array.from(path);
  if (stripLeading) while (str[0] === '/') str.shift();
  return normalize(str.join(''), stripTrailing);
}
