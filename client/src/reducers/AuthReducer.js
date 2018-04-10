import { AuthActionType } from '../actions/Auth/AuthActions';
import { combine } from './util';

const defaultState = {
  isLoggedIn: false,
  isLoading: false,
  isCheckingAuth: true,
  isCodeReset: false,
  isPasswordReset: false,
  isAdmin: false,
  message: '',
  user: null,
  error: '',
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case AuthActionType.LOGGING_IN:
      return combine(defaultState, {
        isLoading: true,
        isLoggedIn: false,
        isCheckingAuth: false,
        error: '',
      });

    case AuthActionType.LOGIN_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        isLoggedIn: true,
        user: action.user,
        isCheckingAuth: false,
        isAdmin: action.user.role === 'admin',
        error: '',
      });

    case AuthActionType.LOGIN_FAILURE:
    case AuthActionType.PASSWORD_CODE_RESET_FAILURE:
    case AuthActionType.PASSWORD_RESET_FAILURE:
      return combine(defaultState, {
        isLoading: false,
        isLoggedIn: false,
        error: action.error,
        isCheckingAuth: false,
      });

    case AuthActionType.LOGOUT:
      return combine(defaultState, {
        isLoading: false,
        isLoggedIn: false,
        isCheckingAuth: false,
        error: '',
      });

    case AuthActionType.PASSWORD_CODE_RESET_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        isCheckingAuth: false,
        isCodeReset: true,
        message: action.message,
        error: '',
      });

    case AuthActionType.PASSWORD_RESET_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        isCheckingAuth: false,
        isPasswordReset: true,
        message: action.message,
        error: '',
      });
      
    default:
      return state;
  }
}
