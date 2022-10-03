export type FileType = 'text' | 'image';

export type GqlError = { __typename: string; message: string; stack?: string };
