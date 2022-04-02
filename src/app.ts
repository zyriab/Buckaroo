import express from 'express';
import { RequestBody, ResponseBody } from './definitions/root';
import { graphqlHTTP } from 'express-graphql';
import { NoSchemaIntrospectionCustomRule } from 'graphql';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { gqlSchema } from './graphql/schema/gqlSchema';
import { gqlResolvers } from './graphql/resolvers/resolvers';
import { checkAuth } from './middlewares/checkAuth';
import { checkBucketExists } from './middlewares/checkBucketExists';
import { setReqMetadata } from './middlewares/setReqMetadata';
import { setTestingData } from './middlewares/setTestingData';
import dotenv from 'dotenv';

const IS_DEV = process.env.NODE_ENV !== 'production';

if (IS_DEV) dotenv.config();

const app = express();

if (!IS_DEV) {
  app.use(helmet());
}

app.use(bodyParser.json());

app.use((req: RequestBody, res: ResponseBody<any>, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.use(checkAuth);
  app.use(setReqMetadata);
  app.use(checkBucketExists);
} else {
  app.use(setTestingData);
}

app.use(
  '/gql',
  graphqlHTTP(async () => ({
    schema: gqlSchema,
    rootValue: gqlResolvers,
    validationRules: [NoSchemaIntrospectionCustomRule],
    graphiql: IS_DEV,
  }))
);

export default app;
