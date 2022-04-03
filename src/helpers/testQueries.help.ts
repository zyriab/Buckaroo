const errorSpreads = `
  ... on ServerError {
    message
  }
  ... on Unauthenticated {
    message
  }
  ... on Unauthorized {
    message
  }
  ... on StorageNotFound {
    message
  }
`;

export const listQuery = {
  query: `
    query ListBucketContent($path: String!, $showRoot: Boolean) {
      listBucketContent(listInput: { path: $path, showRoot: $showRoot }) {
        __typename
        ... on FileList {
          list {
            id
            name
            lastModified
            size
            path
            versions {
              id
              name
              lastModified
              size
              path
            }
          }
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    path: '',
    showRoot: false,
  },
};

export const fetchDlUrlQuery = {
  query: `
    query GetDownloadUrl($fileName: String!, $path: String!, $rootPath: Boolean){
      getDownloadUrl(fileInput: {fileName: $fileName, path: $path, rootPath: $rootPath}) {
        __typename
        ... on SignedUrl {
          url
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    fileName: '',
    path: '',
    rootPath: false,
  },
};

export const fetchUpUrlQuery = {
  query: `
    query GetUploadUrl($fileName: String!, $path: String!, $rootPath: Boolean) {
      getUploadUrl(fileInput: {fileName: $fileName, path: $path, rootPath: $rootPath}) {
        __typename
        ... on SignedUrl {
          url
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    fileName: '',
    path: '',
    rootPath: false,
  },
};

export const deleteFileQuery = {
  query: `
    mutation DeleteOneFile($fileName: String!, $path: String!, $rootPath: Boolean) {
      deleteOneFile(fileInput: {fileName: $fileName, path: $path, rootPath: $rootPath}) {
        __typename
        ... on FileName {
          name
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    fileName: '',
    path: '',
    rootPath: false,
  },
};

export const deleteManyFileQuery = {
  query: `
    mutation deleteManyFiles($fileNames: [String!]!, $path: String!, $versionIds: [String!], $rootPath: Boolean) {
      deleteManyFiles(filesInput: { fileNames: $fileNames, path: $path, versionIds: $versionIds, rootPath: $rootPath }) {
        __typename
        ... on FileNameList {
          names
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    fileNames: [''],
    path: '',
    versionIds: [''],
    rootPath: false,
  },
};

export const restoreFileVersionQuery = {
  query: `
  mutation RestoreFileVersion($fileName: String!, $path: String!, $versionId: String!, $rootPath: Boolean) {
    restoreFileVersion(fileInput: { fileName: $fileName, path: $path, versionId: $versionId, rootPath: $rootPath }) {
      __typename
      ... on VersionId {
        id
      }
      ${errorSpreads}
    }
  }
  `,
  variables: {
    fileName: '',
    path: '',
    versionId: '',
    rootPath: false,
  },
};

export const deleteDirectoryQuery = {
  query: `
    mutation deleteDir($dirPath: String!, $bucketName: String){
      deleteDirectory(directoryInput: { dirPath: $dirPath, bucketName: $bucketName }) {
        __typename
        ... on Directory {
          name
          path
          bucketName
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    dirPath: '',
    bucketName: '',
  },
};
