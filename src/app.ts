const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema/gqlSchema');
const resolvers = require('./graphql/resolvers/resolvers');

require('dotent').config();

const app = express();

app.get('/health', async (req, res) =>
  res.status(200).json({ response: 'working successfully' })
);

app.use(
  '/gql',
  graphqlHTTP(async () => ({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
  }))
);

module.exports = app;

// import express from 'express';
// import bodyParser from 'body-parser';
// import helmet from 'helmet';
// import dotenv from 'dotenv';
// import { graphqlHTTP } from 'express-graphql';
// import { NoSchemaIntrospectionCustomRule } from 'graphql';
// import { RequestBody, ResponseBody } from './definitions/root';
// import gqlSchema from './graphql/schema/gqlSchema';
// import gqlResolvers from './graphql/resolvers/resolvers';
// import checkAuth from './middlewares/checkAuth';
// import checkBucketExists from './middlewares/checkBucketExists';
// import checkBucketVersioning from './middlewares/checkBucketVersioning';
// import setReqMetadata from './middlewares/setReqMetadata';
// import setTestingData from './middlewares/setTestingData';

// const IS_DEV = process.env.NODE_ENV === 'development';
// const IS_TEST = process.env.NODE_ENV === 'test';

// // if (IS_DEV) dotenv.config();
// dotenv.config();

// const app = express();

// if (!IS_DEV) app.use(helmet());

// app.use(bodyParser.json());

// // eslint-disable-next-line consistent-return
// app.use((req: RequestBody, res: ResponseBody<any>, next: any) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });

// if (!IS_TEST) {
//   app.use(checkAuth);
//   app.use(setReqMetadata);
//   app.use(checkBucketExists);
//   app.use(checkBucketVersioning);
// } else {
//   app.use(setTestingData);
// }

// app.get('/health', async (req, res) =>
//   res.status(200).json({ response: 'working successfully' })
// );

// app.use(
//   '/gql',
//   graphqlHTTP(async () => ({
//     schema: gqlSchema,
//     rootValue: gqlResolvers,
//     validationRules: [NoSchemaIntrospectionCustomRule],
//     graphiql: IS_DEV,
//   }))
// );

// export default app;
