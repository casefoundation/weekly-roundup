import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateEmail, validatePassword, validateString } from '../../common/Validator';

export const UsersActionType = {
  USERS_LOADING: 'USERS_LOADING',
  USERS_GET_SUCCESS: 'USER_GETS_SUCCESS',
  USERS_GET_FAILURE: 'USER_GETS_FAILURE',

  USERS_CREATE_SUCCESS: 'USERS_CREATE_SUCCESS',
  USERS_CREATE_FAILURE: 'USERS_CREATE_FAILURE',

  USERS_UPDATE_SUCCESS: 'USERS_UPDATE_SUCCESS',
  USERS_UPDATE_FAILURE: 'USERS_UPDATE_FAILURE',

  USERS_DELETE_SUCCESS: 'USERS_DELETE_SUCCESS',
  USERS_DELETE_FAILURE: 'USERS_DELETE_FAILURE',
};

export function usersLoading() {
  return action(UsersActionType.USERS_LOADING);
}

export function usersGetSuccess(users, page, totalCount) {
  return action(UsersActionType.USERS_GET_SUCCESS, {
    users,
    page,
    totalCount,
  });
}

export function usersGetFailure(error) {
  return action(UsersActionType.USERS_GET_FAILURE, {
    error,
  });
}

export function usersGet(page = 1) {
  return dispatch => {
    dispatch(usersLoading());
    axiosReq()
      .get(`/api/users/${page}`)
      .then(({ data: { data, error } }) => {
        if (data) {
          dispatch(usersGetSuccess(data.users, page, data.count));
        } else {
          dispatch(usersGetFailure(error));
        }
      })
      .catch(error => {
        dispatch(usersGetFailure(error));
      });
  };
}

export function userUpdate(id, email, role, password) {
  let validationError;
  if (!validateEmail(email)) {
    validationError = `Invalid email format: ${email}`;
  } else if (role !== 'admin' && role !== 'user') {
    validationError = 'Invalid role type. Must be admin or user.';
  } else if (!validatePassword(password, true)) {
    validationError = 'Invalid password format. Must be 6-36 characters.';
  }
  if (validationError) {
    return userUpdateFailure(validationError);
  }

  return dispatchBasicReq(
    axiosReq().post('/api/user', {
      id,
      email,
      role,
      password,
    }),
    usersLoading,
    userUpdateSuccess,
    userUpdateFailure
  );
}

export function userUpdateSuccess(user) {
  return action(UsersActionType.USERS_UPDATE_SUCCESS, {
    user,
  });
}

export function userUpdateFailure(error) {
  return action(UsersActionType.USERS_UPDATE_FAILURE, {
    error,
  });
}

export function userCreate(email, role, password) {
  let validationError;
  if (!validateEmail(email)) {
    validationError = `Invalid email format: ${email}`;
  } else if (role !== 'admin' && role !== 'user') {
    validationError = 'Invalid role type. Must be admin or user.';
  } else if (!validatePassword(password, true)) {
    validationError = 'Invalid password format. Must be 6-36 characters.';
  }
  if (validationError) {
    return userUpdateFailure(validationError);
  }

  return dispatchBasicReq(
    axiosReq().put('/api/user', {
      email,
      role,
      password,
    }),
    usersLoading,
    userCreateSuccess,
    userCreateFailure
  );
}

export function userCreateSuccess(user) {
  return action(UsersActionType.USERS_CREATE_SUCCESS, {
    user,
  });
}

export function userCreateFailure(error) {
  return action(UsersActionType.USERS_CREATE_FAILURE, {
    error,
  });
}

export function userDelete(id) {
  return dispatchBasicReq(
    axiosReq().post('/api/user/remove', {
      id,
    }),
    usersLoading,
    userDeleteSuccess,
    userDeleteFailure
  );
}

export function userDeleteSuccess(user) {
  return action(UsersActionType.USERS_DELETE_SUCCESS, {
    user,
  });
}

export function userDeleteFailure(error) {
  return action(UsersActionType.USERS_DELETE_FAILURE, {
    error,
  });
}
