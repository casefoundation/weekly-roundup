export const combine = (...args) => {
  let combined = {};
  args.forEach(arg => {
    combined = Object.assign(combined, arg);
  });
  return combined;
}