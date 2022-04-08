/* eslint-disable no-console */
import { createWriteStream, createReadStream } from 'fs';
import normalize from 'normalize-path';
import sanitize from 'sanitize-filename';
import fetch from 'cross-fetch';
// eslint-disable-next-line import/no-extraneous-dependencies
import FormData from 'form-data';
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
  fields: {},
  localPath: string,
  fileName: string
) {
  const targetUrl = new URL(url);
  const filePath = `${normalize(localPath)}/${sanitize(fileName)}`;
  const form = new FormData();

  Object.entries(fields).forEach(([field, value]) => form.append(field, value));
  form.append('file', createReadStream(filePath));

  form.submit(targetUrl.toString(), (err, res) => {
    if (err) console.error(err);
    console.log(`%c${res.statusCode}: ${res.statusMessage}`, 'color: yellow');
  });
}
