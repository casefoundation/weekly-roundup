import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateString, validatePassword } from '../../common/Validator';

export const SettingsActionType = {
  SETTINGS_LOADING: 'SETTINGS_LOADING',
  SETTINGS_GET_SUCCESS: 'SETTINGS_GET_SUCCESS',
  SETTINGS_GET_FAILURE: 'SETTINGS_GET_FAILURE',

  SETTINGS_UPDATE_SUCCESS: 'SETTINGS_UPDATE_SUCCESS',
  SETTINGS_UPDATE_FAILURE: 'SETTINGS_UPDATE_FAILURE',
};

export function settingsLoading() {
  return action(SettingsActionType.SETTINGS_LOADING);
}

export function settingsGetSuccess(settings) {
  return action(SettingsActionType.SETTINGS_GET_SUCCESS, {
    settings,
  });
}

export function settingsGetFailure(error) {
  return action(SettingsActionType.SETTINGS_GET_FAILURE, {
    error,
  });
}

export function settingsGet(id) {
  return dispatchBasicReq(
    axiosReq().get(`/api/user/${id}`),
    settingsLoading,
    settingsGetSuccess,
    settingsGetFailure
  );
}

export function settingsUpdate(signature, old_password, new_password) {
  let validationError;
  if (!validateString(signature, 0, 512, true)) {
    validationError = `Invalid Signature. Must be 0-512 characters: ${signature}`;
  }
  if (old_password) {
    if (!validatePassword(old_password)) {
      validationError = 'Invalid old password format. Must be 6-36 characters.';
    } else if (!validatePassword(new_password)) {
      validationError = 'Invalid new password format. Must be 6-36 characters.';
    }
    if (validationError) {
      return settingsUpdateFailure(validationError);
    }
  }

  return dispatchBasicReq(
    axiosReq().post('/api/settings', {
      signature,
      old_password,
      new_password,
    }),
    settingsLoading,
    settingsUpdateSuccess,
    settingsUpdateFailure
  );
}

export function settingsUpdateSuccess(settings) {
  return action(SettingsActionType.SETTINGS_UPDATE_SUCCESS, {
    settings,
  });
}

export function settingsUpdateFailure(error) {
  return action(SettingsActionType.SETTINGS_UPDATE_FAILURE, {
    error,
  });
}
