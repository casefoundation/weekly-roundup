exports.formatResponse = (data, error) => {
  let err = error;
  if (typeof error === 'object') {
    err = error.message;
  }
  return {
    data,
    error: err,
  };
};
