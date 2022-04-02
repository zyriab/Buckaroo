import {
  ListInput,
  FileInput,
  FilesInput,
  DirectoryInput,
} from '../../definitions/generated/graphql';
import {
  requestSignedUrl,
  deleteManyFiles,
  deleteOneFile,
  restoreFileVersion,
  deleteDirectory,
  checkBucketExists,
  checkBucketVersioning,
} from '../../utils/s3.utils';
import { listBucketContent } from '../../utils/s3/listBucketContent';
import { resolveAuth } from '../../utils/auth.utils';
import { RequestBody } from '../../definitions/root';
import normalize from 'normalize-path';

export const gqlResolvers = {
  listBucketContent: async (
    args: { listInput: ListInput },
    req: RequestBody
  ) => {
    try {
      const [authed, error] = resolveAuth(
        req,
        args.listInput.showRoot ? 'read:bucket' : undefined
      );
      if (!authed) return error;

      const [failure, content] = await listBucketContent({
        req: req,
        path: args.listInput.path,
        showRoot: args.listInput.showRoot || undefined,
      });

      if (failure) throw failure;

      return {
        __typename: 'FileList',
        list: content,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  // FIXME: Signed post URL is missing headers
  getUploadUrl: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      const [authed, error] = resolveAuth(req);
      if (!authed) return error;

      const [failure, url, fields] = await requestSignedUrl({
        req: req,
        reqCommand: 'UPLOAD',
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
      });

      if (failure !== undefined) throw failure;

      return {
        __typename: 'SignedUrl',
        url: url,
        fields: fields,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  getDownloadUrl: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      const [authed, error] = resolveAuth(req);
      if (!authed) return error;

      const [failure, url] = await requestSignedUrl({
        req: req,
        reqCommand: 'DOWNLOAD',
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        versionId: args.fileInput.versionId || undefined,
      });

      if (failure) throw failure;

      return {
        __typename: 'SignedUrl',
        url: url,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  deleteOneFile: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      const [authed, error] = resolveAuth(req);
      if (!authed) return error;

      const [failure, fileName] = await deleteOneFile({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
      });

      if (failure) throw failure;

      return {
        __typename: 'FileName',
        name: fileName,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  deleteManyFiles: async (
    args: { filesInput: FilesInput },
    req: RequestBody
  ) => {
    try {
      const [authed, error] = resolveAuth(req);
      if (!authed) return error;

      const [failure, fileNames] = await deleteManyFiles({
        req,
        fileNames: args.filesInput.fileNames,
        path: args.filesInput.path,
      });

      if (failure) throw failure;

      return {
        __typename: 'FileNameList',
        names: fileNames,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  deleteDirectory: async (
    args: { directoryInput: DirectoryInput },
    req: RequestBody
  ) => {
    try {
      const isOwner =
        args.directoryInput.dirPath ===
        `${req.body.userName}-${req.body.userId}`;

      const [authed, error] = resolveAuth(
        req,
        !isOwner ? 'delete:directory' : undefined
      );
      if (!authed) return error;

      const [storageError, exists] = await checkBucketExists(
        args.directoryInput.bucketName || req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;
      if (!exists)
        return [
          undefined,
          false,
          {
            __typename: 'StorageNotFound',
            message: 'The requested bucket could not be found',
          },
        ];

      const [failure, done] = await deleteDirectory({
        req,
        dirPath: args.directoryInput.dirPath,
        bucketName: args.directoryInput.bucketName || undefined,
      });

      if (failure) throw failure;
      if (!done) throw new Error('Something went wrong...');

      const dirName = args.directoryInput.dirPath.split('/').pop()!;
      const path = normalize(args.directoryInput.dirPath.replace(dirName, ''));

      return {
        __typename: 'Directory',
        name: dirName != '' ? dirName : path,
        path: `${path}/`,
        bucketName:
          args.directoryInput.bucketName || req.body.tenant.bucket.name,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  restoreFileVersion: async (
    args: { fileInput: FileInput },
    req: RequestBody
  ) => {
    try {
      const [authed, error] = resolveAuth(req);
      if (!authed) return error;

      if (!await checkBucketVersioning({ bucketName: req.body.tenant.bucket.name }))
        throw new Error('The requested file is not on a versioned storage.');

      const [failure, newId] = await restoreFileVersion({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        versionId: args.fileInput.versionId!,
      });

      if (failure) throw failure;

      return {
        __typename: 'VersionId',
        id: newId,
      };
    } catch (err) {
      return {
        __typename: 'ServerError',
        message: `${err}`,
      };
    }
  },
  // TODO: Implement upload through the API
  // uploadFile: async (args: UploadInput, req: RequestBody) => {},
};