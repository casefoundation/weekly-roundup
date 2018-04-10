import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateString } from '../../common/Validator';

export const ArticleGroupActionType = {
  ARTICLEGROUP_LOADING: 'ARTICLEGROUP_LOADING',

  ARTICLEGROUP_CREATE: 'ARTICLEGROUP_CREATE',
  ARTICLEGROUP_CREATING: 'ARTICLEGROUP_CREATING',
  ARTICLEGROUP_CREATE_SUCCESS: 'ARTICLEGROUP_CREATE_SUCCESS',
  ARTICLEGROUP_CREATE_FAILURE: 'ARTICLEGROUP_CREATE_FAILURE',

  ARTICLEGROUP_UPDATE: 'ARTICLEGROUP_UPDATE',
  ARTICLEGROUP_UPDATE_SUCCESS: 'ARTICLEGROUP_UPDATE_SUCCESS',
  ARTICLEGROUP_UPDATE_FAILURE: 'ARTICLEGROUP_UPDATE_FAILURE',

  ARTICLEGROUP_DELETE: 'ARTICLEGROUP_DELETE',
  ARTICLEGROUP_DELETE_SUCCESS: 'ARTICLEGROUP_DELETE_SUCCESS',
  ARTICLEGROUP_DELETE_FAILURE: 'ARTICLEGROUP_DELETE_FAILURE',
};

export function articleGroupLoading(id) {
  return action(ArticleGroupActionType.ARTICLEGROUP_LOADING, {
    id,
  });
}

// ARTICLEGROUP CREATE ACTIONS

export function articleGroupCreate(roundup_id, name, roundup_order) {
  if (!validateString(name, 0, 255)) {
    return articleGroupCreateFailure(`Invalid Article Group Name. Must be 0-255 characters: ${name}`);
  }

  return dispatchBasicReq(
    axiosReq().put('/api/articleGroup', {
      roundup_id,
      name,
      roundup_order,
    }),
    articleGroupCreating,
    articleGroupCreateSuccess,
    articleGroupCreateFailure
  );
}

export function articleGroupCreating() {
  return action(ArticleGroupActionType.ARTICLEGROUP_CREATING);
}

export function articleGroupCreateSuccess(articleGroup) {
  return action(ArticleGroupActionType.ARTICLEGROUP_CREATE_SUCCESS, {
    articleGroup,
  });
}

export function articleGroupCreateFailure(error) {
  return action(ArticleGroupActionType.ARTICLEGROUP_CREATE_FAILURE, {
    error,
  });
}

// ARTICLEGROUP DELETE ACTIONS

export function articleGroupDelete(id) {
  return dispatchBasicReq(
    axiosReq().post('/api/articleGroup/remove', {
      id,
    }),
    () => articleGroupLoading(id),
    articleGroupDeleteSuccess,
    articleGroupDeleteFailure
  );
}

export function articleGroupDeleteSuccess(articleGroup) {
  return action(ArticleGroupActionType.ARTICLEGROUP_DELETE_SUCCESS, {
    articleGroup,
  });
}

export function articleGroupDeleteFailure(error) {
  return action(ArticleGroupActionType.ARTICLEGROUP_DELETE_FAILURE, {
    error,
  });
}

// ARTICLEGROUP UPDATE ACTIONS

export function articleGroupUpdate(id, name, roundup_order_shift) {
  if (!validateString(name, 0, 255)) {
    return articleGroupCreateFailure(`Invalid Article Group Name. Must be 0-255 characters: ${name}`);
  }

  return dispatchBasicReq(
    axiosReq().post('/api/articleGroup', {
      id,
      name,
      roundup_order_shift,
    }),
    () => articleGroupLoading(id),
    articleGroupUpdateSuccess,
    articleGroupUpdateFailure
  );
}

export function articleGroupUpdateSuccess(articleGroup) {
  return action(ArticleGroupActionType.ARTICLEGROUP_UPDATE_SUCCESS, {
    articleGroup,
  });
}

export function articleGroupUpdateFailure(error) {
  return action(ArticleGroupActionType.ARTICLEGROUP_UPDATE_FAILURE, {
    error,
  });
}
