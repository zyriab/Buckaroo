export default function handleErrorResponse(error: Error) {
  if (process.env.NODE_ENV === 'production') {
    return {
      __typename: 'ServerError',
      message: error,
    };
  }

  return {
    __typename: 'ServerError',
    message: error,
    stack: error.stack,
  };
}
