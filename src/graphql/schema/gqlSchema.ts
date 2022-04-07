import 'graphql-import-node';
import { buildASTSchema } from 'graphql';
import schema from './schema.graphql';

const gqlSchema = buildASTSchema(schema);

export default gqlSchema;
