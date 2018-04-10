import { normalize } from 'normalizr';
import { UserSchema } from '../schemas/UserSchema';

import { UsersActionType } from '../actions/Users/UsersActions';
import { combine } from './util';

const defaultState = {
  isLoading: true,
  users: {},
  page: 1,
  totalCount: 0,
  newUser: null,
  deletedUser: null,
  updatedUser: null,
  error: '',
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case UsersActionType.USERS_LOADING:
      return combine(defaultState, {
        isLoading: true,
        error: '',
      });
    
    case UsersActionType.USERS_GET_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        users: normalize(action.users, {
          users: [UserSchema],
        }),
        page: action.page,
        totalCount: action.totalCount,
        error: '',
      });

    case UsersActionType.USERS_GET_FAILURE:
    case UsersActionType.USERS_CREATE_FAILURE:
    case UsersActionType.USERS_UPDATE_FAILURE:
    case UsersActionType.USERS_DELETE_FAILURE:
      return combine(state, {
        isLoading: false,
        error: action.error,
      });

    case UsersActionType.USERS_CREATE_SUCCESS:
      return combine(state, {
        isLoading: false,
        newUser: action.user,
        error: '',
      });
    
    case UsersActionType.USERS_UPDATE_SUCCESS:
      return combine(state, {
        isLoading: false,
        updatedUser: action.user,
        error: '',
      });
      
    case UsersActionType.USERS_DELETE_SUCCESS:
      return combine(state, {
        isLoading: false,
        deletedUser: action.user,
        error: '',
      });

    default:
      return state;
  }
}
