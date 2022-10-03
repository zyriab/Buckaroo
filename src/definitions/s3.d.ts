export interface BucketParams {
  Bucket: string;
  Key: string;
  Body: string;
}

export interface DeleteMarker {
  name: string;
  id: string;
  path: string;
  isLatest: boolean;
}

export interface Directory {
  path: string;
  id: string;
}
