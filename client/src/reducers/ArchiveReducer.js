import { normalize } from 'normalizr';
import { RoundupSchema } from '../schemas/RoundupSchema';

import { ArchiveActionType } from '../actions/Archive/ArchiveActions';
import { combine } from './util';

const defaultState = {
  isLoading: true,
  archive: {},
  page: 1,
  totalCount: 0,
  error: '',
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case ArchiveActionType.ARCHIVE_LOADING:
      return combine(state, {
        isLoading: true,
        error: '',
      });
    
    case ArchiveActionType.ARCHIVE_GET_SUCCESS:
      return combine(state, {
        isLoading: false,
        archive: normalize(action.archive, {
          roundups: [RoundupSchema],
        }),
        page: action.page,
        totalCount: action.totalCount,
        error: '',
      });

    case ArchiveActionType.ARCHIVE_GET_FAILURE:
      return combine(state, {
        isLoading: false,
        error: action.error,
      });

    default:
      return state;
  }
}
