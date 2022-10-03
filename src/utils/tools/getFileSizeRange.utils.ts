import { FileType } from '../../definitions/types';

/** For presigned POST conditionning */
export default function getFileSizeRange(
  type?: FileType
): ['content-length-range', 1, number] {
  const mib = 1048576;
  let max = 0;
  switch (type) {
    case 'text':
      max = mib * 5;
      break;
    case 'image':
      max = mib * 10;
      break;
    default:
      max = mib * 1;
      break;
  }
  return ['content-length-range', 1, max];
}
