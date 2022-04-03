import { createWriteStream, createReadStream, statSync } from 'fs';
import normalize from 'normalize-path';
import sanitize from 'sanitize-filename';
import fetch from 'cross-fetch';
import { URL } from 'url';

/** This is only used for testing - hence its location in /helpers/ and not /utils/ */

export async function downloadFileLocally(
  url: string,
  path: string,
  fileName: string
) {
  const targetUrl = new URL(url);
  const filePath = `${normalize(path)}/${sanitize(fileName)}`;
  const res = await fetch(targetUrl.toString());
  const fileStream = createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    // @ts-ignore
    res.body!.pipe(fileStream);
    // @ts-ignore
    res.body!.on('error', reject);
    fileStream.on('finish', resolve);
  });

  return res;
}

export async function uploadFileToS3(
  url: string,
  localPath: string,
  fileName: string
) {
  const targetUrl = new URL(url);
  const filePath = `${normalize(localPath)}/${sanitize(fileName)}`;
  const payload = createReadStream(filePath);

  const res = await fetch(targetUrl.toString(), {
    method: 'PUT',
    headers: {
      'Content-Length': `${statSync(filePath).size}`,
    },
    // @ts-ignore
    body: payload,
  });

  return res;
}
