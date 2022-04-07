import normalize from 'normalize-path';
import {
  ListInput,
  FileInput,
  FilesInput,
  DirectoryInput,
} from '../../definitions/generated/graphql';
import { RequestBody } from '../../definitions/root';
import {
  deleteManyFiles,
  deleteOneFile,
  restoreFileVersion,
  deleteDirectory,
  isBucketExisting,
  isBucketVersioned,
  getDownloadUrl,
  getUploadUrl,
  listBucketContent,
} from '../../utils/s3.utils';
import { resolveAuth } from '../../utils/auth.utils';
import formatPath from '../../utils/tools/formatPath.utils';

const gqlResolvers = {
  listBucketContent: async (
    args: { listInput: ListInput },
    req: RequestBody
  ) => {
    try {
      const isExternalBucket =
        args.listInput.bucketName &&
        args.listInput.bucketName !== req.body.tenant.bucket.name;

      const [authed, error] = resolveAuth(
        req,
        args.listInput.root !== undefined || isExternalBucket
          ? 'read:bucket'
          : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        args.listInput.bucketName || req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const root =
        args.listInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, content] = await listBucketContent({
        req,
        root,
        path: args.listInput.path,
        bucketName: args.listInput.bucketName || undefined,
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
        args.fileInput.root !== undefined ? 'create:file' : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, url] = await getUploadUrl({
        req,
        fileName: args.fileInput.fileName,
        root,
        path: args.fileInput.path,
      });

      if (failure !== undefined) throw failure;

      return {
        __typename: 'SignedUrl',
        url,
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
        args.fileInput.root !== undefined ? 'read:bucket' : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, url] = await getDownloadUrl({
        req,
        fileName: args.fileInput.fileName,
        root,
        path: args.fileInput.path,
        versionId: args.fileInput.versionId || undefined,
      });

      if (failure) throw failure;

      return {
        __typename: 'SignedUrl',
        url,
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
        args.fileInput.root !== undefined ? 'delete:file' : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, fileName] = await deleteOneFile({
        req,
        fileName: args.fileInput.fileName,
        path: args.fileInput.path,
        root,
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
        args.filesInput.root !== undefined ? 'delete:file' : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const root =
        args.filesInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, fileNames] = await deleteManyFiles({
        req,
        fileNames: args.filesInput.fileNames,
        root,
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
      const root =
        args.directoryInput.root ?? `${req.body.username}-${req.body.userId}`;
      const isOwner = root.startsWith(
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

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      const [failure, done] = await deleteDirectory({
        req,
        path: args.directoryInput.path,
        root,
        bucketName: args.directoryInput.bucketName || undefined,
      });

      if (failure) throw failure;
      if (!done) throw new Error('Something went wrong...');

      const fullPath = formatPath(`${root}/${args.directoryInput.path}`);
      const dirName = fullPath.split('/').filter(Boolean).pop()!;
      const path = normalize(fullPath.replace(dirName, ''));

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
        args.fileInput.root !== undefined ? 'update:file' : undefined
      );

      if (!authed) return error;

      const [storageError, exists] = await isBucketExisting(
        req.body.tenant.bucket.name
      );

      if (storageError) throw storageError;

      if (!exists) {
        return {
          __typename: 'StorageNotFound',
          message: 'The requested bucket could not be found',
        };
      }

      if (!(await isBucketVersioned(req.body.tenant.bucket.name))) {
        throw new Error('The requested file is not on a versioned storage.');
      }

      if (!args.fileInput.versionId) {
        throw new Error('No version id specified!');
      }

      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;

      const [failure, newId] = await restoreFileVersion({
        req,
        fileName: args.fileInput.fileName,
        root,
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
};

export default gqlResolvers;
