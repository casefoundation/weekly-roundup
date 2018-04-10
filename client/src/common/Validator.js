export function validateDate(date, isNullAllowed) {
  if (isNullAllowed && !date) {
    return true;
  }
  try {
    const x = new Date(date);
    return !isNaN(x.getDate());
  } catch (error) {
    return false;
  }
}

export function validateEmail(email, isNullAllowed) {
  if (isNullAllowed && !email) {
    return true;
  }
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export function validatePassword(password, isNullAllowed) {
  if (isNullAllowed && !password) {
    return true;
  }
  return password && password.length >= 6 && password.length <= 32;
}

export function validateString(value, minLength, maxLength, isNullAllowed) {
  if (isNullAllowed && !value) {
    return true;
  }
  return value && value.length >= minLength && value.length <= maxLength;
}

export function validateUrl(url, isNullAllowed) {
  if (isNullAllowed && !url) {
    return true;
  }
  const re =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return re.test(url);
}
