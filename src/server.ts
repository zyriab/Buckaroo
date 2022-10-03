/* eslint-disable no-console */
import app from './app';

const server = app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}...`)
);

export default server;
