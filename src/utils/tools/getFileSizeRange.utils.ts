export type Filetype = 'text' | 'image';

export function getFileSizeRange(
  type?: Filetype
): ['content-length-range', 0, number] {
  const mib = 1048576;
  let max = 0;
  switch (type) {
    case 'text':
      max = mib * 5;
    case 'image':
      max = mib * 5;
    default:
      max = mib;
  }
  return ['content-length-range', 0, max];
}
