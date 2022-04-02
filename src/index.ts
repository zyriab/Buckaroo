import app from './app';

export const server = app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}...`)
);
