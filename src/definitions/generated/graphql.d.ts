import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type DeleteDirectoryResult = Directory | ServerError | StorageNotFound | Unauthenticated | Unauthorized;

export type DeleteFileResult = FileName | FileNameList | ServerError | StorageNotFound | Unauthenticated | Unauthorized;

export type Directory = {
  __typename?: 'Directory';
  bucketName?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
};

export type DirectoryInput = {
  bucketName?: InputMaybe<Scalars['String']>;
  dirPath: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  id?: Maybe<Scalars['ID']>;
  lastModified: Scalars['String'];
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['Int'];
  versions?: Maybe<Array<Version>>;
};

export type FileInput = {
  fileName: Scalars['String'];
  path: Scalars['String'];
  rootPath?: InputMaybe<Scalars['Boolean']>;
  versionId?: InputMaybe<Scalars['String']>;
};

export type FileList = {
  __typename?: 'FileList';
  list: Array<File>;
};

export type FileName = {
  __typename?: 'FileName';
  name: Scalars['String'];
};

export type FileNameList = {
  __typename?: 'FileNameList';
  names: Array<Scalars['String']>;
};

export type FilesInput = {
  fileNames: Array<Scalars['String']>;
  path: Scalars['String'];
};

export type ListBucketResult = FileList | ServerError | StorageNotFound | Unauthenticated | Unauthorized;

/** INPUT TYPES */
export type ListInput = {
  path: Scalars['String'];
  showRoot?: InputMaybe<Scalars['Boolean']>;
};

export type Mutations = {
  __typename?: 'Mutations';
  deleteDirectory?: Maybe<DeleteDirectoryResult>;
  deleteManyFiles?: Maybe<DeleteFileResult>;
  deleteOneFile?: Maybe<DeleteFileResult>;
  restoreFileVersion?: Maybe<RestoreFileResult>;
};


export type MutationsDeleteDirectoryArgs = {
  directoryInput?: InputMaybe<DirectoryInput>;
};


export type MutationsDeleteManyFilesArgs = {
  fileInput: FileInput;
};


export type MutationsDeleteOneFileArgs = {
  fileInput: FileInput;
};


export type MutationsRestoreFileVersionArgs = {
  fileInput: FileInput;
};

export type Queries = {
  __typename?: 'Queries';
  getDownloadUrl: SignedUrlResult;
  getUploadUrl: SignedUrlResult;
  listBucketContent: ListBucketResult;
};


export type QueriesGetDownloadUrlArgs = {
  fileInput: FileInput;
};


export type QueriesGetUploadUrlArgs = {
  fileInput: FileInput;
};


export type QueriesListBucketContentArgs = {
  listInput: ListInput;
};

export type RestoreFileResult = ServerError | StorageNotFound | Unauthenticated | Unauthorized | VersionId;

export type ServerError = {
  __typename?: 'ServerError';
  message: Scalars['String'];
};

export type SignedUrl = {
  __typename?: 'SignedUrl';
  url: Scalars['String'];
};

export type SignedUrlResult = ServerError | SignedUrl | StorageNotFound | Unauthenticated | Unauthorized;

export type StorageNotFound = {
  __typename?: 'StorageNotFound';
  message: Scalars['String'];
};

/** ERROR TYPES */
export type Unauthenticated = {
  __typename?: 'Unauthenticated';
  message: Scalars['String'];
};

export type Unauthorized = {
  __typename?: 'Unauthorized';
  message: Scalars['String'];
};

export type Version = {
  __typename?: 'Version';
  id: Scalars['ID'];
  lastModified: Scalars['String'];
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['Int'];
};

export type VersionId = {
  __typename?: 'VersionId';
  id: Scalars['ID'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DeleteDirectoryResult: ResolversTypes['Directory'] | ResolversTypes['ServerError'] | ResolversTypes['StorageNotFound'] | ResolversTypes['Unauthenticated'] | ResolversTypes['Unauthorized'];
  DeleteFileResult: ResolversTypes['FileName'] | ResolversTypes['FileNameList'] | ResolversTypes['ServerError'] | ResolversTypes['StorageNotFound'] | ResolversTypes['Unauthenticated'] | ResolversTypes['Unauthorized'];
  Directory: ResolverTypeWrapper<Directory>;
  DirectoryInput: DirectoryInput;
  File: ResolverTypeWrapper<File>;
  FileInput: FileInput;
  FileList: ResolverTypeWrapper<FileList>;
  FileName: ResolverTypeWrapper<FileName>;
  FileNameList: ResolverTypeWrapper<FileNameList>;
  FilesInput: FilesInput;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  ListBucketResult: ResolversTypes['FileList'] | ResolversTypes['ServerError'] | ResolversTypes['StorageNotFound'] | ResolversTypes['Unauthenticated'] | ResolversTypes['Unauthorized'];
  ListInput: ListInput;
  Mutations: ResolverTypeWrapper<{}>;
  Queries: ResolverTypeWrapper<{}>;
  RestoreFileResult: ResolversTypes['ServerError'] | ResolversTypes['StorageNotFound'] | ResolversTypes['Unauthenticated'] | ResolversTypes['Unauthorized'] | ResolversTypes['VersionId'];
  ServerError: ResolverTypeWrapper<ServerError>;
  SignedUrl: ResolverTypeWrapper<SignedUrl>;
  SignedUrlResult: ResolversTypes['ServerError'] | ResolversTypes['SignedUrl'] | ResolversTypes['StorageNotFound'] | ResolversTypes['Unauthenticated'] | ResolversTypes['Unauthorized'];
  StorageNotFound: ResolverTypeWrapper<StorageNotFound>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Unauthenticated: ResolverTypeWrapper<Unauthenticated>;
  Unauthorized: ResolverTypeWrapper<Unauthorized>;
  Version: ResolverTypeWrapper<Version>;
  VersionId: ResolverTypeWrapper<VersionId>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  DeleteDirectoryResult: ResolversParentTypes['Directory'] | ResolversParentTypes['ServerError'] | ResolversParentTypes['StorageNotFound'] | ResolversParentTypes['Unauthenticated'] | ResolversParentTypes['Unauthorized'];
  DeleteFileResult: ResolversParentTypes['FileName'] | ResolversParentTypes['FileNameList'] | ResolversParentTypes['ServerError'] | ResolversParentTypes['StorageNotFound'] | ResolversParentTypes['Unauthenticated'] | ResolversParentTypes['Unauthorized'];
  Directory: Directory;
  DirectoryInput: DirectoryInput;
  File: File;
  FileInput: FileInput;
  FileList: FileList;
  FileName: FileName;
  FileNameList: FileNameList;
  FilesInput: FilesInput;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  ListBucketResult: ResolversParentTypes['FileList'] | ResolversParentTypes['ServerError'] | ResolversParentTypes['StorageNotFound'] | ResolversParentTypes['Unauthenticated'] | ResolversParentTypes['Unauthorized'];
  ListInput: ListInput;
  Mutations: {};
  Queries: {};
  RestoreFileResult: ResolversParentTypes['ServerError'] | ResolversParentTypes['StorageNotFound'] | ResolversParentTypes['Unauthenticated'] | ResolversParentTypes['Unauthorized'] | ResolversParentTypes['VersionId'];
  ServerError: ServerError;
  SignedUrl: SignedUrl;
  SignedUrlResult: ResolversParentTypes['ServerError'] | ResolversParentTypes['SignedUrl'] | ResolversParentTypes['StorageNotFound'] | ResolversParentTypes['Unauthenticated'] | ResolversParentTypes['Unauthorized'];
  StorageNotFound: StorageNotFound;
  String: Scalars['String'];
  Unauthenticated: Unauthenticated;
  Unauthorized: Unauthorized;
  Version: Version;
  VersionId: VersionId;
};

export type DeleteDirectoryResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteDirectoryResult'] = ResolversParentTypes['DeleteDirectoryResult']> = {
  __resolveType: TypeResolveFn<'Directory' | 'ServerError' | 'StorageNotFound' | 'Unauthenticated' | 'Unauthorized', ParentType, ContextType>;
};

export type DeleteFileResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteFileResult'] = ResolversParentTypes['DeleteFileResult']> = {
  __resolveType: TypeResolveFn<'FileName' | 'FileNameList' | 'ServerError' | 'StorageNotFound' | 'Unauthenticated' | 'Unauthorized', ParentType, ContextType>;
};

export type DirectoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Directory'] = ResolversParentTypes['Directory']> = {
  bucketName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FileResolvers<ContextType = any, ParentType extends ResolversParentTypes['File'] = ResolversParentTypes['File']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  lastModified?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  versions?: Resolver<Maybe<Array<ResolversTypes['Version']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FileListResolvers<ContextType = any, ParentType extends ResolversParentTypes['FileList'] = ResolversParentTypes['FileList']> = {
  list?: Resolver<Array<ResolversTypes['File']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FileNameResolvers<ContextType = any, ParentType extends ResolversParentTypes['FileName'] = ResolversParentTypes['FileName']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FileNameListResolvers<ContextType = any, ParentType extends ResolversParentTypes['FileNameList'] = ResolversParentTypes['FileNameList']> = {
  names?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListBucketResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ListBucketResult'] = ResolversParentTypes['ListBucketResult']> = {
  __resolveType: TypeResolveFn<'FileList' | 'ServerError' | 'StorageNotFound' | 'Unauthenticated' | 'Unauthorized', ParentType, ContextType>;
};

export type MutationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutations'] = ResolversParentTypes['Mutations']> = {
  deleteDirectory?: Resolver<Maybe<ResolversTypes['DeleteDirectoryResult']>, ParentType, ContextType, Partial<MutationsDeleteDirectoryArgs>>;
  deleteManyFiles?: Resolver<Maybe<ResolversTypes['DeleteFileResult']>, ParentType, ContextType, RequireFields<MutationsDeleteManyFilesArgs, 'fileInput'>>;
  deleteOneFile?: Resolver<Maybe<ResolversTypes['DeleteFileResult']>, ParentType, ContextType, RequireFields<MutationsDeleteOneFileArgs, 'fileInput'>>;
  restoreFileVersion?: Resolver<Maybe<ResolversTypes['RestoreFileResult']>, ParentType, ContextType, RequireFields<MutationsRestoreFileVersionArgs, 'fileInput'>>;
};

export type QueriesResolvers<ContextType = any, ParentType extends ResolversParentTypes['Queries'] = ResolversParentTypes['Queries']> = {
  getDownloadUrl?: Resolver<ResolversTypes['SignedUrlResult'], ParentType, ContextType, RequireFields<QueriesGetDownloadUrlArgs, 'fileInput'>>;
  getUploadUrl?: Resolver<ResolversTypes['SignedUrlResult'], ParentType, ContextType, RequireFields<QueriesGetUploadUrlArgs, 'fileInput'>>;
  listBucketContent?: Resolver<ResolversTypes['ListBucketResult'], ParentType, ContextType, RequireFields<QueriesListBucketContentArgs, 'listInput'>>;
};

export type RestoreFileResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['RestoreFileResult'] = ResolversParentTypes['RestoreFileResult']> = {
  __resolveType: TypeResolveFn<'ServerError' | 'StorageNotFound' | 'Unauthenticated' | 'Unauthorized' | 'VersionId', ParentType, ContextType>;
};

export type ServerErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['ServerError'] = ResolversParentTypes['ServerError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignedUrlResolvers<ContextType = any, ParentType extends ResolversParentTypes['SignedUrl'] = ResolversParentTypes['SignedUrl']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignedUrlResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SignedUrlResult'] = ResolversParentTypes['SignedUrlResult']> = {
  __resolveType: TypeResolveFn<'ServerError' | 'SignedUrl' | 'StorageNotFound' | 'Unauthenticated' | 'Unauthorized', ParentType, ContextType>;
};

export type StorageNotFoundResolvers<ContextType = any, ParentType extends ResolversParentTypes['StorageNotFound'] = ResolversParentTypes['StorageNotFound']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnauthenticatedResolvers<ContextType = any, ParentType extends ResolversParentTypes['Unauthenticated'] = ResolversParentTypes['Unauthenticated']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnauthorizedResolvers<ContextType = any, ParentType extends ResolversParentTypes['Unauthorized'] = ResolversParentTypes['Unauthorized']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Version'] = ResolversParentTypes['Version']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastModified?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['VersionId'] = ResolversParentTypes['VersionId']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DeleteDirectoryResult?: DeleteDirectoryResultResolvers<ContextType>;
  DeleteFileResult?: DeleteFileResultResolvers<ContextType>;
  Directory?: DirectoryResolvers<ContextType>;
  File?: FileResolvers<ContextType>;
  FileList?: FileListResolvers<ContextType>;
  FileName?: FileNameResolvers<ContextType>;
  FileNameList?: FileNameListResolvers<ContextType>;
  ListBucketResult?: ListBucketResultResolvers<ContextType>;
  Mutations?: MutationsResolvers<ContextType>;
  Queries?: QueriesResolvers<ContextType>;
  RestoreFileResult?: RestoreFileResultResolvers<ContextType>;
  ServerError?: ServerErrorResolvers<ContextType>;
  SignedUrl?: SignedUrlResolvers<ContextType>;
  SignedUrlResult?: SignedUrlResultResolvers<ContextType>;
  StorageNotFound?: StorageNotFoundResolvers<ContextType>;
  Unauthenticated?: UnauthenticatedResolvers<ContextType>;
  Unauthorized?: UnauthorizedResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
  VersionId?: VersionIdResolvers<ContextType>;
};

