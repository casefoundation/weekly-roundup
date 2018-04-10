import { action, axiosReq } from '../util';

export const ArchiveActionType = {
  ARCHIVE_LOADING: 'ARCHIVE_LOADING',
  ARCHIVE_GET_SUCCESS: 'ARCHIVE_GET_SUCCESS',
  ARCHIVE_GET_FAILURE: 'ARCHIVE_GET_FAILURE',
};

export function archiveLoading() {
  return action(ArchiveActionType.ARCHIVE_LOADING);
}

export function archiveGetSuccess(archive, page, totalCount) {
  return action(ArchiveActionType.ARCHIVE_GET_SUCCESS, {
    archive,
    page,
    totalCount,
  });
}

export function archiveGetFailure(error) {
  return action(ArchiveActionType.ARCHIVE_GET_FAILURE, {
    error,
  });
}

export function archiveGet(page = 1) {
  return dispatch => {
    dispatch(archiveLoading());
    axiosReq()
      .get(`/api/roundup/archive/${page}`)
      .then(({ data: { data, error } }) => {
        if (data) {
          dispatch(archiveGetSuccess(data, page, data.totalCount));
        } else {
          dispatch(archiveGetFailure(error));
        }
      })
      .catch(error => {
        dispatch(archiveGetFailure(error));
      });
  };
}
