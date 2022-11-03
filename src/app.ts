import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { graphqlHTTP } from 'express-graphql';
import { NoSchemaIntrospectionCustomRule } from 'graphql';
import { RequestBody, ResponseBody } from './definitions/root';
import gqlSchema from './graphql/schema/gqlSchema';
import gqlResolvers from './graphql/resolvers/resolvers';
import checkAuth from './middlewares/checkAuth';
import checkBucketVersioning from './middlewares/checkBucketVersioning';
import setReqMetadata from './middlewares/setReqMetadata';
import setTestingData from './middlewares/setTestingData';
import 'dotenv/config';

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_TEST = process.env.NODE_ENV === 'test';
const IS_OFFLINE = IS_DEV || IS_TEST;
const IS_ONLINE = !IS_OFFLINE;

const app = express();

if (IS_ONLINE) app.use(helmet());

app.use(bodyParser.json());

// eslint-disable-next-line consistent-return
app.use((req: RequestBody, res: ResponseBody<any>, next: any) => {
  // CORS is taken care of in AWS Lambda
  if (IS_OFFLINE) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

if (IS_ONLINE) {
  app.use(checkAuth);
  app.use(setReqMetadata);
  app.use(checkBucketVersioning);
} else {
  app.use(setTestingData);
}

app.use(
  '/',
  graphqlHTTP(async () => ({
    schema: gqlSchema,
    rootValue: gqlResolvers,
    validationRules: IS_ONLINE ? [NoSchemaIntrospectionCustomRule] : [],
    graphiql: IS_OFFLINE,
  }))
);

export default app;
