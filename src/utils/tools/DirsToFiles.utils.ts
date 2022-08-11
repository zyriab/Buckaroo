import { Directory } from '../../definitions/s3';
import formatPath from './formatPath.utils';

export default function DirsToFiles(dirs: Directory[]) {
  const res = [];

  for (const dir of dirs) {
    const pathArr = formatPath(dir.path).split('/');

    // Excluding root directory
    if (pathArr.length > 1) {
      res.push({
        id: dir.id,
        name: pathArr.pop(),
        path: dir.path,
        lastModified: '',
        size: 0,
        versions: undefined,
      });
    }
  }

  return res;
}
