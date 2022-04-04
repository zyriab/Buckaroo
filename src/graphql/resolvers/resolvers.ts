import {
  ListInput,
  FileInput,
  FilesInput,
  DirectoryInput,
} from '../../definitions/generated/graphql';
import {
  deleteManyFiles,
  deleteOneFile,
  restoreFileVersion,
  deleteDirectory,
  isBucketExisting,
  isBucketVersioned,
  getDownloadUrl,
  getUploadUrl,
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
  getUploadUrl: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      const [authed, error] = resolveAuth(
        req,
        args.fileInput.rootPath ? 'create:file' : undefined
      );
      if (!authed) return error;

      const [failure, url] = await getUploadUrl({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        rootPath: args.fileInput.rootPath || undefined,
      });

      if (failure !== undefined) throw failure;

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
  getDownloadUrl: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      const [authed, error] = resolveAuth(
        req,
        args.fileInput.rootPath ? 'read:bucket' : undefined
      );
      if (!authed) return error;

      const [failure, url] = await getDownloadUrl({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        versionId: args.fileInput.versionId || undefined,
        rootPath: args.fileInput.rootPath || undefined,
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
      const [authed, error] = resolveAuth(
        req,
        args.fileInput.rootPath ? 'delete:file' : undefined
      );
      if (!authed) return error;

      const [failure, fileName] = await deleteOneFile({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        rootPath: args.fileInput.rootPath || undefined,
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
      const [authed, error] = resolveAuth(
        req,
        args.filesInput.rootPath ? 'delete:file' : undefined
      );
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
      const isOwner = args.directoryInput.dirPath.startsWith(
        `${req.body.username}-${req.body.userId}`
      );

      const [authed, error] = resolveAuth(
        req,
        !isOwner ? 'delete:directory' : undefined
      );
      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        args.directoryInput.bucketName || req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;
      if (!exists)
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };

      const [failure, done] = await deleteDirectory({
        req,
        dirPath: args.directoryInput.dirPath,
        bucketName: args.directoryInput.bucketName || undefined,
      });

      if (failure) throw failure;
      if (!done) throw new Error('Something went wrong...');

      const dirName = normalize(args.directoryInput.dirPath)
        .split('/')
        .filter(Boolean)
        .pop()!;
      const path = normalize(args.directoryInput.dirPath.replace(dirName, ''));

      return {
        __typename: 'Directory',
        name: `${dirName}/`,
        path: normalize(`${path}/`, false),
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
      const [authed, error] = resolveAuth(
        req,
        args.fileInput.rootPath ? 'update:file' : undefined
      );
      if (!authed) return error;

      if (!(await isBucketVersioned(req.body.tenant.bucket.name)))
        throw new Error('The requested file is not on a versioned storage.');

      if (!args.fileInput.versionId)
        throw new Error('No version id specified!');

      const [failure, newId] = await restoreFileVersion({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        versionId: args.fileInput.versionId!,
        rootPath: args.fileInput.rootPath || undefined,
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
};
