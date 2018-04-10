import { normalize } from 'normalizr';
import { RoundupSchema, updateRoundup } from '../schemas/RoundupSchema';

import { RoundupActionType } from '../actions/Roundup/RoundupActions';
import { ArticleGroupActionType } from '../actions/ArticleGroup/ArticleGroupActions';
import { ArticleActionType } from '../actions/Article/ArticleActions';

import { addNewArticles, deleteArticle, updateArticle } from '../schemas/ArticleSchema';
import { addNewArticleGroup, deleteArticleGroup, updateArticleGroup } from '../schemas/ArticleGroupSchema';

import { combine } from './util';

const defaultState = {
  loadingArticleGroups: [], // article group ids that are loading articles
  articleGroupCreating: false,  // true when article group is being created
  isLoading: true,          // is roundup loading
  roundup: null,            // normalized roundup
  isNew: false,             // is new roundup
  deleted: false,           // was roundup deleted
  isSending: false,         // roundup is sending email
  isSent: false,            // round email was successfully sent
  error: '',
};

export default function (state = defaultState, action) {
  switch (action.type) {
    // ROUNDUP ACTIONS

    case RoundupActionType.ROUNDUP_LOADING:
      return combine(state, {
        isLoading: true,
        error: '',
      });

    case RoundupActionType.ROUNDUP_UPDATING:
      return combine(state, {
        isUpdating: true,
        error: '',
      });
    
    case RoundupActionType.ROUNDUP_CREATE_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        roundup: action.roundup,
        isNew: true,
        error: '',
      });

    case RoundupActionType.ROUNDUP_DELETE_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        deleted: action.roundup,
        error: '',
      });

    case RoundupActionType.ROUNDUP_GET_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        roundup: normalize(action.roundup, RoundupSchema),
        error: '',
      });

    case RoundupActionType.ROUNDUP_UPDATE_SUCCESS:
      return combine(defaultState, {
        isLoading: false,
        roundup: updateRoundup(state.roundup, action.roundup),
        error: '',
      });

    case RoundupActionType.ROUNDUP_SENDING:
      return combine(state, {
        isSending: true,
        error: '',
      });

    case RoundupActionType.ROUNDUP_SEND_SUCCESS:
      return combine(state, {
        isSending: false,
        isSent: true,
        error: '',
      });
      
    case RoundupActionType.ROUNDUP_CREATE_FAILURE:
    case RoundupActionType.ROUNDUP_DELETE_FAILURE:
    case RoundupActionType.ROUNDUP_UPDATE_FAILURE:
    case RoundupActionType.ROUNDUP_GET_FAILURE:
    case RoundupActionType.ROUNDUP_SEND_FAILURE:
    case ArticleGroupActionType.ARTICLEGROUP_CREATE_FAILURE:
    case ArticleGroupActionType.ARTICLEGROUP_UPDATE_FAILURE:
    case ArticleGroupActionType.ARTICLEGROUP_DELETE_FAILURE:
    case ArticleActionType.ARTICLE_UPDATE_FAILURE:
    case ArticleActionType.ARTICLE_DELETE_FAILURE:
      return combine(state, {
        isLoading: false,
        isSending: false,
        articleGroupCreating: false,
        error: action.error,
      });
      
    case ArticleActionType.ARTICLE_CREATE_FAILURE:
      return combine(state, {
        isLoading: false,
        loadingArticleGroups: state.loadingArticleGroups.filter(x => x !== action.article_group_id),
        error: action.error,
      });

    // ARTICLE GROUP ACTIONS

    case ArticleGroupActionType.ARTICLEGROUP_CREATING:
      return combine(state, {
        articleGroupCreating: true,
        error: '',
      });

    case ArticleGroupActionType.ARTICLEGROUP_CREATE_SUCCESS:
      return combine(state, {
        roundup: addNewArticleGroup(state.roundup, action.articleGroup),
        articleGroupCreating: false,
        error: '',
      });

    case ArticleGroupActionType.ARTICLEGROUP_DELETE_SUCCESS:
      return combine(state, {
        roundup: deleteArticleGroup(state.roundup, action.articleGroup),
        error: '',
      });
    
    case ArticleGroupActionType.ARTICLEGROUP_UPDATE_SUCCESS:
      return combine(state, {
        roundup: updateArticleGroup(state.roundup, action.articleGroup),
        error: '',
      });

    // ARTICLE ACTIONS
  
    case ArticleActionType.ARTICLE_CREATE_LOADING:
      return combine(state, {
        loadingArticleGroups: state.loadingArticleGroups.concat(action.articleGroupId),
        error: '',
      });

    case ArticleActionType.ARTICLE_CREATE_SUCCESS:
      return combine(state, {
        roundup: addNewArticles(state.roundup, action.articles),
        loadingArticleGroups:
          action.articles.length > 0 ?
            state.loadingArticleGroups.filter(x => x !== action.articles[0].article_group_id) :
            state.loadingArticleGroups,
        error: '',
      });

    case ArticleActionType.ARTICLE_DELETE_SUCCESS:
      return combine(state, {
        roundup: deleteArticle(state.roundup, action.article),
        error: '',
      });

    case ArticleActionType.ARTICLE_UPDATE_SUCCESS:
      return combine(state, {
        roundup: updateArticle(state.roundup, action.article),
        error: '',
      });
      
    default:
      return state;
  }
}
