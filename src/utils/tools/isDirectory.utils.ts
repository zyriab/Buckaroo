import getFileExtension from './getFileExtension.utils';

export default function isDirectory(key: string) {
  return getFileExtension(key.split('/')[key!.split('/').length - 1]) === '';
}
