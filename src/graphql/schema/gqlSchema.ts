import 'graphql-import-node';
import { buildASTSchema } from 'graphql';
import schema from './schema.graphql';
export const gqlSchema = buildASTSchema(schema);
