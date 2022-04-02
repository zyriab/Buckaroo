const errorSpreads = `
  ... on ServerError {
    message
  }
  ... on Unauthenticated {
    message
  }
  ... on StorageNotFound {
    message
  }
`;

export const listQuery = {
  query: `
    query ListBucketContent($path: String!) {
      listBucketContent(listInput: {path: $path}) {
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
        ... on Unauthorized {
          message
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    path: '',
  },
};

export const fetchDlUrlQuery = {
  query: `
    query GetDownloadUrl($fileName: String!, $path: String!){
      getDownloadUrl(fileInput: {fileName: $fileName, path: $path}) {
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
  },
};

export const fetchUpUrlQuery = {
  query: `
    query GetUploadUrl($fileName: String!, $path: String!) {
      getUploadUrl(fileInput: {fileName: $fileName, path: $path}) {
        __typename
        ... on SignedUrl {
          url
          fields {
            key
            value
          }
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    fileName: '',
    path: '',
  },
};

export const deleteFileQuery = {
  query: `
    mutation DeleteOneFile($fileName: String!, $path: String!) {
      deleteOneFile(fileInput: {fileName: $fileName, path: $path}) {
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
  },
};

export const deleteManyFileQuery = {
  query: `
    mutation deleteManyFiles($fileNames: [String!]!, $path: String!) {
      deleteManyFiles(fileInput: {fileNames: $filesNames, path: $path}) {
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
  },
};

export const restoreFileVersionQuery = {
  query: `
  mutation RestoreFileVersion($versionId: String!) {
    restoreFileVersion(fileInput: {fileName: "example.txt", path: "translations", versionId: $versionId}) {
      __typename
      ... on VersionId {
        id
      }
      ${errorSpreads}
    }
  }
  `,
  variables: {
    versionId: '',
  },
};

export const deleteDirectoryQuery = {
  query: `
    mutation deleteDir($dirPath: String!){
      deleteDirectory(directoryInput: {dirPath: $dirPath}) {
        __typename
        ... on Directory {
          name
          path
          bucketName
        }
        ... on Unauthorized {
          message
        }
        ${errorSpreads}
      }
    }
  `,
  variables: {
    dirPath: '',
  },
};
