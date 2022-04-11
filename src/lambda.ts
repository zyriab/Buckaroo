/* eslint-disable import/no-import-module-exports */
import awsServerlessExpress from 'aws-serverless-express';
import app from './app';
// eslint-disable-next-line import/no-extraneous-dependencies
require('source-map-support').install();

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any): any => {
  console.log('Testing handler')
  awsServerlessExpress.proxy(server, event, context);
};
