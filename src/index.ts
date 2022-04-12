/* eslint-disable import/no-import-module-exports */
import awsServerlessExpress from 'aws-serverless-express';
import app from './app';

require('source-map-support').install();

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any): any =>
  awsServerlessExpress.proxy(server, event, context);
