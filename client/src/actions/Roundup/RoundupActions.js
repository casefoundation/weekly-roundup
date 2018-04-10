import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateString, validateEmail } from '../../common/Validator';

export const RoundupActionType = {
  ROUNDUP_LOADING: 'ROUNDUP_LOADING',
  ROUNDUP_CREATE_SUCCESS: 'ROUNDUP_CREATE_SUCCESS',
  ROUNDUP_CREATE_FAILURE: 'ROUNDUP_CREATE_FAILURE',

  ROUNDUP_GET_SUCCESS: 'ROUNDUP_GET_SUCCESS',
  ROUNDUP_GET_FAILURE: 'ROUNDUP_GET_FAILURE',
  
  ROUNDUP_UPDATING: 'ROUNDUP_UPDATING',
  ROUNDUP_UPDATE_SUCCESS: 'ROUNDUP_UPDATE_SUCCESS',
  ROUNDUP_UPDATE_FAILURE: 'ROUNDUP_UPDATE_FAILURE',

  ROUNDUP_DELETE_SUCCESS: 'ROUNDUP_DELETE_SUCCESS',
  ROUNDUP_DELETE_FAILURE: 'ROUNDUP_DELETE_FAILURE',

  ROUNDUP_SENDING: 'ROUNDUP_SENDING',
  ROUNDUP_SEND_SUCCESS: 'ROUNDUP_SEND_SUCCESS',
  ROUNDUP_SEND_FAILURE: 'ROUNDUP_SEND_FAILURE',
};

export function roundupLoading() {
  return action(RoundupActionType.ROUNDUP_LOADING);
}

// ROUNDUP CREATE ACTIONS

export function roundupCreate() {
  return dispatchBasicReq(
    axiosReq().put('/api/roundup'),
    roundupLoading,
    roundupCreateSuccess,
    roundupCreateFailure
  );
}

export function roundupCreateSuccess(roundup) {
  return action(RoundupActionType.ROUNDUP_CREATE_SUCCESS, {
    roundup,
  });
}

export function roundupCreateFailure(error) {
  return action(RoundupActionType.ROUNDUP_CREATE_FAILURE, {
    error,
  });
}

// ROUNDUP GET ACTIONS

export function roundupGet(id) {
  return dispatchBasicReq(
    axiosReq().get(`/api/roundup/${id}`),
    roundupLoading,
    roundupGetSuccess,
    roundupGetFailure
  );
}

export function roundupGetSuccess(roundup) {
  return action(RoundupActionType.ROUNDUP_GET_SUCCESS, {
    roundup,
  });
}

export function roundupGetFailure(error) {
  return action(RoundupActionType.ROUNDUP_GET_FAILURE, {
    error,
  });
}

// ROUNDUP DELETE ACTIONS

export function roundupDelete(id) {
  return dispatchBasicReq(
    axiosReq().post('/api/roundup/remove', {
      id,
    }),
    roundupLoading,
    roundupDeleteSuccess,
    roundupDeleteFailure
  );
}

export function roundupDeleteSuccess(roundup) {
  return action(RoundupActionType.ROUNDUP_DELETE_SUCCESS, {
    roundup,
  });
}

export function roundupDeleteFailure(error) {
  return action(RoundupActionType.ROUNDUP_DELETE_FAILURE, {
    error,
  });
}

// ROUNDUP UPDATE ACTIONS

export function roundupUpdating() {
  return action(RoundupActionType.ROUNDUP_UPDATING);
}

export function roundupUpdate(id, subject, to, cc, preface) {
  let validationError;
  if (!validateString(subject, 0, 255, true)) {
    validationError = `Invalid Subject. Must be 0-255 characters: ${subject}`;
  } else if (!validateString(preface, 0, 4166, true)) {
    validationError = `Invalid Preface. Must be 0-4166 characters: ${subject}`;
  } else if (to.length > 0) {
    to.forEach(t => {
      if (!validateEmail(t) || !validateString(t, 0, 255)) {
        validationError = validationError || '';
        validationError += `Invalid Email: ${t}\n`;
      }
    });
  } else if (cc.length > 0) {
    cc.forEach(c => {
      if (!validateEmail(c) || !validateString(c, 0, 255)) {
        validationError = validationError || '';
        validationError += `Invalid Email: ${c}\n`;
      }
    });
  }
  if (validationError) {
    return roundupUpdateFailure(validationError);
  }

  return dispatchBasicReq(
    axiosReq().post('/api/roundup', {
      id,
      subject,
      to,
      cc,
      preface,
    }),
    roundupUpdating,
    roundupUpdateSuccess,
    roundupUpdateFailure
  );
}

export function roundupUpdateSuccess(roundup) {
  return action(RoundupActionType.ROUNDUP_UPDATE_SUCCESS, {
    roundup,
  });
}

export function roundupUpdateFailure(error) {
  return action(RoundupActionType.ROUNDUP_UPDATE_FAILURE, {
    error,
  });
}

// ROUNDUP SEND EMAIL ACTIONS

export function roundupSending() {
  return action(RoundupActionType.ROUNDUP_SENDING);
}

export function roundupSend(roundup_id) {
  return dispatchBasicReq(
    axiosReq().post('/api/roundup/send', {
      roundup_id,
    }),
    roundupSending,
    roundupSendSuccess,
    roundupSendFailure
  );
}

export function roundupSendSuccess() {
  return action(RoundupActionType.ROUNDUP_SEND_SUCCESS);
}

export function roundupSendFailure(error) {
  return action(RoundupActionType.ROUNDUP_SEND_FAILURE, {
    error,
  });
}
