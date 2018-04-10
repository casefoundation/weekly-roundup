import { action, axiosReq, dispatchBasicReq } from '../util';
import { validateUrl, validateString, validateDate } from '../../common/Validator';

export const ArticleActionType = {
  ARTICLE_CREATE_LOADING: 'ARTICLE_CREATE_LOADING',
  ARTICLE_CREATE_SUCCESS: 'ARTICLE_CREATE_SUCCESS',
  ARTICLE_CREATE_FAILURE: 'ARTICLE_CREATE_FAILURE',

  ARTICLE_UPDATE_LOADING: 'ARTICLE_UPDATE_LOADING',
  ARTICLE_UPDATE_SUCCESS: 'ARTICLE_UPDATE_SUCCESS',
  ARTICLE_UPDATE_FAILURE: 'ARTICLE_UPDATE_FAILURE',

  ARTICLE_DELETE_LOADING: 'ARTICLE_DELETE_LOADING',
  ARTICLE_DELETE_SUCCESS: 'ARTICLE_DELETE_SUCCESS',
  ARTICLE_DELETE_FAILURE: 'ARTICLE_DELETE_FAILURE',
};

// ARTICLE CREATE ACTIONS

export function articleCreateLoading(articleGroupId) {
  return action(ArticleActionType.ARTICLE_CREATE_LOADING, {
    articleGroupId,
  });
}

export function articleCreate(article_group_id, urls = [], group_order_start = 0) {
  // Validate urls
  let validationError;
  if (urls.length === 0) {
    validationError = 'Please provide at least one url to analyze.';
  }
  urls.forEach(url => {
    if (!validateUrl(url)) {
      validationError = `Invalid Url Format: ${url}`;
    }
  });
  if (validationError) {
    return articleCreateFailure(validationError, article_group_id);
  }

  return dispatch => {
    try {
      dispatch(articleCreateLoading(article_group_id));

      const requestPromises = [];
      let group_order = group_order_start + 1;

      // Create article for each existing url
      urls.forEach(url => {
        if (url) {
          requestPromises.push(
            axiosReq().put('/api/article', {
              article_group_id,
              url,
              group_order,
            })
          );
          group_order += 1;
        }
      });

      // Dispatch success action with all newly analyzed articles.
      // Errors are included with analyzed articles as some articles may fail.
      Promise.all(requestPromises)
        .then(results => {
          const articles = [];
          const errors = [];
          results.forEach(({ data: { data, error } }) => {
            if (data) {
              articles.push(data);
            } else {
              errors.push(error);
            }
          });
          dispatch(articleCreateSuccess(articles, errors.join(' ')));
        })
        .catch(error => {
          dispatch(articleCreateFailure(error, article_group_id));
        });
    } catch (error) {
      dispatch(articleCreateFailure(error, article_group_id));
    }
  };
}

export function articleCreateSuccess(articles, error) {
  return action(ArticleActionType.ARTICLE_CREATE_SUCCESS, {
    articles,
    error,
  });
}

export function articleCreateFailure(error, article_group_id) {
  return action(ArticleActionType.ARTICLE_CREATE_FAILURE, {
    error,
    article_group_id,
  });
}

// ARTICLE DELETE ACTIONS

export function articleDeleteLoading() {
  return action(ArticleActionType.ARTICLE_DELETE_LOADING);
}

export function articleDelete(id) {
  return dispatchBasicReq(
    axiosReq().post('/api/article/remove', {
      id,
    }),
    articleDeleteLoading,
    articleDeleteSuccess,
    articleDeleteFailure
  );
}

export function articleDeleteSuccess(article) {
  return action(ArticleActionType.ARTICLE_DELETE_SUCCESS, {
    article,
  });
}

export function articleDeleteFailure(error) {
  return action(ArticleActionType.ARTICLE_DELETE_FAILURE, {
    error,
  });
}

// ARTICLE UPDATE ACTIONS

export function articleUpdateLoading(id) {
  return action(ArticleActionType.ARTICLE_UPDATE_LOADING, {
    id,
  });
}

export function articleUpdate(id, title, url, published, source, summary, group_order_shift) {
  let validateError;
  if (!validateUrl(url, true)) {
    validateError = `Invalid Url Format: ${url}`;
  } else if (!validateString(title, 0, 255, true)) {
    validateError = `Invalid Title. Must be 0-255 characters: ${title}`;
  } else if (!validateString(source, 0, 255, true)) {
    validateError = `Invalid Source. Must be 0-64 characters: ${source}`;
  } else if (!validateString(summary, 0, 4166, true)) {
    validateError = `Invalid Summary. Must be 0-4166 characters: ${summary}`;
  }
  if (validateError) {
    return articleUpdateFailure(validateError);
  }

  return dispatchBasicReq(
    axiosReq().post('/api/article', {
      id,
      title,
      url,
      source,
      published,
      summary,
      group_order_shift,
    }),
    articleUpdateLoading,
    articleUpdateSuccess,
    articleUpdateFailure
  );
}

export function articleUpdateSuccess(article) {
  return action(ArticleActionType.ARTICLE_UPDATE_SUCCESS, {
    article,
  });
}

export function articleUpdateFailure(error) {
  return action(ArticleActionType.ARTICLE_UPDATE_FAILURE, {
    error,
  });
}
