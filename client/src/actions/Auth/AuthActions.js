import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateEmail, validatePassword } from '../../common/Validator';

export const AuthActionType = {
  LOGIN: 'LOGIN',
  LOGGING_IN: 'LOGGING_IN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CHECK_AUTH: 'CHECK_AUTH',
  CHECKING_AUTH: 'CHECKING_AUTH',

  PASSWORD_RESETTING: 'PASSWORD_RESETTING',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE: 'PASSWORD_RESET_FAILURE',
  PASSWORD_CODE_RESET_SUCCESS: 'PASSWORD_CODE_RESET_SUCCESS',
  PASSWORD_CODE_RESET_FAILURE: 'PASSWORD_CODE_RESET_FAILURE',
};

export function checkAuth() {
  return dispatch => {
    dispatch(checkingAuth());
    axiosReq()
      .get('/api/user/checkauth')
      .then(({ data: { data, error } }) => {
        if (data && data.message === 'ok') {
          dispatch(loginSuccess(data.user));
        } else {
          if (error) {
            console.log(error);
          }
          dispatch(logout());
        }
      })
      .catch(error => {
        console.log(error);
        dispatch(logout());
      });
  };
}

export function checkingAuth() {
  return action(AuthActionType.CHECKING_AUTH);
}

export function login(email, password) {
  let validateError;
  if (!validateEmail(email)) {
    validateError = `Invalid Email Format: ${email}`;
  } else if (!validatePassword(password)) {
    validateError = 'Invalid Password Format. Must be 6-36 characters long.';
  }
  if (validateError) {
    return loginError(validateError);
  }

  return dispatch => {
    dispatch(loginLoading());
    axiosReq()
      .post('/api/user/login', {
        email,
        password,
      })
      .then(({ data: { data, error } }) => {
        if (data && data.user && data.token) {
          localStorage.setItem('id', data.id);
          localStorage.setItem('token', data.token);
          dispatch(loginSuccess(data.user));
        } else if (error) {
          dispatch(loginError(error));
        } else {
          dispatch(loginError('Unsuccessful Login'));
        }
      })
      .catch(error => {
        console.log(error);
        dispatch(loginError('Error occurred during Login'));
      });
  };
}

export function loginLoading() {
  return action(AuthActionType.LOGGING_IN);
}

export function loginSuccess(user) {
  return action(AuthActionType.LOGIN_SUCCESS, {
    user,
  });
}

export function loginError(error) {
  return action(AuthActionType.LOGIN_FAILURE, {
    error,
  });
}

export function logout() {
  localStorage.removeItem('id');
  localStorage.removeItem('token');
  return action(AuthActionType.LOGOUT);
}

export function passwordResetting() {
  return action(AuthActionType.PASSWORD_RESETTING);
}

export function passwordCodeReset(email) {
  if (!validateEmail(email)) {
    return loginError(`Invalid Email Format: ${email}`);
  }

  return dispatchBasicReq(
    axiosReq().post('/api/user/reset', {
      email,
    }),
    passwordResetting,
    passwordCodeResetSuccess,
    passwordCodeResetFailure
  );
}

export function passwordCodeResetSuccess({ message }) {
  return action(AuthActionType.PASSWORD_CODE_RESET_SUCCESS, {
    message,
  });
}

export function passwordCodeResetFailure(error) {
  return action(AuthActionType.PASSWORD_CODE_RESET_FAILURE, {
    error,
  });
}

export function passwordReset(code) {
  return dispatchBasicReq(
    axiosReq().get(`/api/user/reset/${code}`),
    passwordResetting,
    passwordResetSuccess,
    passwordResetFailure
  );
}

export function passwordResetSuccess({ message }) {
  return action(AuthActionType.PASSWORD_RESET_SUCCESS, {
    message,
  });
}

export function passwordResetFailure(error) {
  return action(AuthActionType.PASSWORD_RESET_FAILURE, {
    error,
  });
}
