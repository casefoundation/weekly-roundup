import { SettingsActionType } from '../actions/Settings/SettingsActions';
import { combine } from './util';

const defaultState = {
  isLoading: true,
  settings: {},
  error: '',
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case SettingsActionType.SETTINGS_LOADING:
      return combine(state, {
        isLoading: true,
        error: '',
      });
    
    case SettingsActionType.SETTINGS_GET_SUCCESS:
      return combine(state, {
        isLoading: false,
        settings: action.settings,
        error: '',
      });

    case SettingsActionType.SETTINGS_GET_FAILURE:
    case SettingsActionType.SETTINGS_UPDATE_FAILURE:
      return combine(state, {
        isLoading: false,
        error: action.error,
      });

    case SettingsActionType.SETTINGS_UPDATE_SUCCESS:
      return combine(state, {
        isLoading: false,
        settings: action.settings,
        error: '',
      });

    default:
      return state;
  }
}
