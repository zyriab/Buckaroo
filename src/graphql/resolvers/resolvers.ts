import normalize from 'normalize-path';
import {
  ListInput,
  FileInput,
  FilesInput,
  DirectoryInput,
  UploadInput,
} from '../../definitions/generated/graphql';
import { FileType, GqlError } from '../../definitions/types';
import { RequestBody } from '../../definitions/root';
import {
  deleteManyFiles,
  deleteOneFile,
  restoreFileVersion,
  deleteDirectory,
  getDownloadUrl,
  getUploadUrl,
  listBucketContent,
  resolveBucket,
  resolveOneFile,
  resolveManyFiles,
  getTextFileContent,
} from '../../utils/s3.utils';
import { formatPath, handleErrorResponse, DirsToFiles } from '../../utils/tools.utils';
import { checkRequestIsAuthed } from '../../utils/auth.utils';
import { Directory } from '../../definitions/s3';

const gqlResolvers = {
  listBucketContent: async (
    args: { listInput: ListInput },
    req: RequestBody
  ) => {
    try {
      const { path } = args.listInput;
      const isExternalBucket =
        args.listInput.bucketName &&
        args.listInput.bucketName !== req.body.tenant.bucket.name;
      const root =
        args.listInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.listInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.listInput.root != null || isExternalBucket
          ? 'read:bucket'
          : undefined
      );

      if (!authed) return authError;

      const [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      const [failure, files, dirs] = await listBucketContent({
        req,
        root,
        path,
        bucketName,
        getDirs: true,
      });

      if (failure) throw failure;

      const objects = [...files, ...DirsToFiles(<Directory[]>dirs)];

      return {
        __typename: 'ObjectList',
        objects,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  getUploadUrl: async (
    args: { uploadInput: UploadInput },
    req: RequestBody
  ) => {
    try {
      const { fileName, fileType, path } = args.uploadInput;
      const root =
        args.uploadInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.uploadInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.uploadInput.root != null ? 'create:file' : undefined
      );

      if (!authed) return authError;

      const [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      const [failure, signedPost] = await getUploadUrl({
        fileName,
        fileType: <FileType>fileType,
        root,
        path,
        bucketName,
      });

      if (failure) throw failure;

      return {
        __typename: 'SignedPost',
        url: signedPost.url,
        fields: signedPost.fields,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  getDownloadUrl: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      let exists: boolean;
      let error: GqlError | undefined;

      const { fileName, path, versionId } = args.fileInput;
      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.fileInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.fileInput.root != null ? 'read:bucket' : undefined
      );

      if (!authed) return authError;

      [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      [exists, error] = await resolveOneFile({
        fileName,
        root,
        path,
        bucketName,
      });

      if (!exists) return error;

      const [failure, url] = await getDownloadUrl({
        fileName,
        root,
        path,
        versionId: versionId || undefined,
        bucketName,
      });

      if (failure) throw failure;

      return {
        __typename: 'SignedUrl',
        url,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  getTextFileContent: async (
    args: { fileInput: FileInput },
    req: RequestBody
  ) => {
    try {
      const { fileName, path, versionId } = args.fileInput;
      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.fileInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.fileInput.root != null ? 'read:file' : undefined
      );

      if (!authed) return authError;

      const [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      const [failure, content] = await getTextFileContent({
        fileName,
        bucketName,
        path,
        root,
        versionId: <string | undefined>versionId,
      });

      if (failure) throw failure;

      return {
        __typename: 'TextFileContent',
        content,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  deleteOneFile: async (args: { fileInput: FileInput }, req: RequestBody) => {
    try {
      let exists: boolean;
      let error: GqlError | undefined;

      const { fileName, path } = args.fileInput;
      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.fileInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.fileInput.root != null ? 'delete:file' : undefined
      );

      if (!authed) return authError;

      [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      [exists, error] = await resolveOneFile({
        fileName,
        root,
        path,
        bucketName,
      });

      if (!exists) return error;

      const [failure, name] = await deleteOneFile({
        req,
        fileName,
        root,
        path,
        bucketName,
      });

      if (failure) throw failure;

      return {
        __typename: 'FileName',
        name,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  deleteManyFiles: async (
    args: { filesInput: FilesInput },
    req: RequestBody
  ) => {
    try {
      let exists: boolean;
      let error: GqlError | undefined;

      const { fileNames, path } = args.filesInput;
      const root =
        args.filesInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.filesInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.filesInput.root != null ? 'delete:file' : undefined
      );

      if (!authed) return authError;

      [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      [exists, error] = await resolveManyFiles({
        fileNames,
        root,
        path,
        bucketName,
      });

      if (!exists) return error;

      const [failure, names] = await deleteManyFiles({
        req,
        fileNames,
        root,
        bucketName,
        path,
      });

      if (failure) throw failure;

      return {
        __typename: 'FileNameList',
        names,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  deleteDirectory: async (
    args: { directoryInput: DirectoryInput },
    req: RequestBody
  ) => {
    try {
      let exists: boolean;
      let error: GqlError | undefined;

      const { path } = args.directoryInput;
      const root =
        args.directoryInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.directoryInput.bucketName || req.body.tenant.bucket.name;
      const isOwner = root.startsWith(
        `${req.body.username}-${req.body.userId}`
      );

      const [authed, authError] = checkRequestIsAuthed(
        req,
        !isOwner ? 'delete:directory' : undefined
      );

      if (!authed) return authError;

      [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      [exists, error] = await resolveOneFile({
        fileName: '', // checking for path existence
        path: args.directoryInput.path,
        root,
        bucketName,
      });

      if (!exists) return error;

      const [failure, done] = await deleteDirectory({
        req,
        path,
        root,
        bucketName,
      });

      if (failure) throw failure;
      if (!done) throw new Error('Something went wrong...');

      const fullPath = formatPath(`${root}/${args.directoryInput.path}`);
      const dirName = fullPath.split('/').filter(Boolean).pop()!;
      const dirPath = normalize(fullPath.replace(dirName, ''));

      return {
        __typename: 'Directory',
        name: `${dirName}/`,
        path: normalize(`${dirPath}/`, false),
        bucketName,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
  restoreFileVersion: async (
    args: { fileInput: FileInput },
    req: RequestBody
  ) => {
    try {
      let exists: boolean;
      let error: GqlError | undefined;

      const { fileName, path, versionId } = args.fileInput;
      const root =
        args.fileInput.root ?? `${req.body.username}-${req.body.userId}`;
      const bucketName =
        args.fileInput.bucketName || req.body.tenant.bucket.name;

      const [authed, authError] = checkRequestIsAuthed(
        req,
        args.fileInput.root != null ? 'update:file' : undefined
      );

      if (!authed) return authError;

      if (!versionId) {
        throw new Error('No version id specified!');
      }

      [exists, error] = await resolveBucket(bucketName);

      if (!exists) return error;

      if (!req.body.tenant.bucket.isVersioned) {
        throw new Error('The requested file is not on a versioned storage.');
      }

      [exists, error] = await resolveOneFile({
        fileName,
        path,
        root,
        bucketName,
      });

      if (!exists) return error;

      const [failure, newId] = await restoreFileVersion({
        req,
        fileName,
        root,
        path,
        bucketName,
        versionId,
      });

      if (failure) throw failure;

      return {
        __typename: 'VersionId',
        id: newId,
      };
    } catch (err) {
      return handleErrorResponse(err as Error);
    }
  },
};

export default gqlResolvers;
