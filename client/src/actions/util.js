import axios from 'axios';

export const action = (type, actionParams = {}) => {
  return Object.assign(actionParams, { type });
}

export function axiosReq() {
  const jwt = localStorage.getItem('token');
  let headers = {};
  if (jwt) {
    headers = {
      Authorization: `Bearer ${jwt}`,
    };
  }
  return axios.create({
    headers,
  });
}

export function dispatchBasicReq(reqPromise, loadingAction, successAction, failureAction) {
  return dispatch => {
    dispatch(loadingAction());
    reqPromise
      .then(({ data: { data, error } }) => {
        if (data) {
          dispatch(successAction(data));
        } else {
          dispatch(failureAction(error));
        }
      })
      .catch(error => {
        dispatch(failureAction(error));
      });
  };
}
