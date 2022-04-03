export type Filetype = 'text' | 'image';

/** For presigned POST conditionning */
export function getFileSizeRange(
  type?: Filetype
): ['content-length-range', 0, number] {
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
      max = mib;
      break;
  }
  return ['content-length-range', 0, max];
}
