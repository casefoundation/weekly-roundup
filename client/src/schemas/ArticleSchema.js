import { schema } from 'normalizr';
import dotprop from 'dot-prop-immutable';

export const ArticleSchema = new schema.Entity('articles');

/**
 * Helper functions to update a normalized Roundup state defined by schemas.
 * Updates lookup tables and entities when entities are added, deleted, and updated.
 */

// ARTICLE UPDATES

export function addNewArticles(roundup, articles = []) {
  let updatedRoundup = roundup;

  let article_group_id;
  if (articles.length > 0) {
    article_group_id = articles[0].article_group_id;
  }

  // Update Lookups
  const articleIds = articles.map(x => x.id);
  let articlesLookup = dotprop.get(roundup, `entities.articleGroups.${article_group_id}.articles`);
  if (!articlesLookup) {
    articlesLookup = [];
  }
  updatedRoundup = dotprop.set(
    updatedRoundup,
    `entities.articleGroups.${article_group_id}.articles`,
    articlesLookup.concat(articleIds)
  );

  // Update Entity
  let articlesArr = dotprop.get(roundup, 'entities.articles');
  if (!articlesArr) {
    articlesArr = {};
  }
  articles.forEach(article => {
    articlesArr[article.id] = article;
  });
  updatedRoundup = dotprop.set(updatedRoundup, 'entities.articles', articlesArr);
  return updatedRoundup;
}

export function deleteArticle(roundup, article) {
  let updatedRoundup = roundup;

  // Update Lookups
  const articlesLookup = dotprop.get(roundup, `entities.articleGroups.${article.article_group_id}.articles`);
  updatedRoundup = dotprop.set(
    updatedRoundup,
    `entities.articleGroups.${article.article_group_id}.articles`,
    articlesLookup.filter(x => x !== article.id)
  );

  // Update Entity
  updatedRoundup = dotprop.delete(updatedRoundup, `entities.articles.${article.id}`);
  return updatedRoundup;
}

export function updateArticle(roundup, article) {
  let updatedRoundup = roundup;

  // Update Entities
  // Update Target Article
  let articles = dotprop.get(updatedRoundup, 'entities.articles');
  const oldArticle = articles[article.id];
  articles[article.id] = article;
  updatedRoundup = dotprop.set(updatedRoundup, 'entities.articles', articles); 
  updatedRoundup = dotprop.set(updatedRoundup, `entities.articles.${article.id}`, article);

  // Swap Article orders if order was changed
  if (article.group_order !== oldArticle.group_order) {
    const articlesLookup = dotprop.get(updatedRoundup, `entities.articleGroups.${article.article_group_id}.articles`);
    const index = articlesLookup.findIndex(x => x === article.id);
    let swapArticleId;
    if (article.group_order > oldArticle.group_order && index < articlesLookup.length - 1) {
      swapArticleId = articlesLookup[index + 1];
    } else if (article.group_order < oldArticle.group_order && index > 0) {
      swapArticleId = articlesLookup[index - 1];
    }
    if (swapArticleId) {
      updatedRoundup =  dotprop.set(updatedRoundup, `entities.articles.${swapArticleId}.group_order`, oldArticle.group_order);
    }
  }
  
  // Re-sort Articles
  articles = dotprop.get(updatedRoundup, 'entities.articles');
  const articlesSortedArr = Object.values(articles).filter(x => x.article_group_id === article.article_group_id).sort((a, b) => {
    if (a.group_order > b.group_order) {
      return 1;
    } else if (a.group_order < b.group_order) {
      return -1;
    }
    return 0;
  });

  // Update Lookups
  updatedRoundup = dotprop.set(updatedRoundup, `entities.articleGroups.${article.article_group_id}.articles`, articlesSortedArr.map(x => x.id));
  return updatedRoundup;
}
