export const getError = (...errors) => {
  const messages = [];
  errors.forEach(error => {
    let message = error;
    if (typeof error === 'object' && 'message' in error) {
      message = error.message;
    } else if (typeof error !== 'string') {
      message = 'Unknown error';
    }
    messages.push(message);
    console.log(error);
  });
  return messages.join('\n').trim();
};
