import { schema } from 'normalizr';
import dotprop from 'dot-prop-immutable';
import { ArticleSchema } from './ArticleSchema';

export const ArticleGroupSchema = new schema.Entity('articleGroups', {
  articles: [ArticleSchema],
});

/**
 * Helper functions to update a normalized Roundup state defined by schemas.
 * Updates lookup tables and entities when entities are added, deleted, and updated.
 */

// ARTICLE GROUP UPDATES

export function addNewArticleGroup(roundup, articleGroup) {
  let updatedRoundup = roundup;

  // Update Lookups
  let articleGroupsLookup = dotprop.get(roundup, `entities.roundups.${roundup.result}.articleGroups`);
  if (!articleGroupsLookup) {
    articleGroupsLookup = [];
  }
  updatedRoundup = dotprop.set(updatedRoundup, `entities.roundups.${roundup.result}.articleGroups`, articleGroupsLookup.concat(articleGroup.id));

  // Update Entity
  let articleGroups = dotprop.get(roundup, 'entities.articleGroups');
  if (!articleGroups) {
    articleGroups = {};
  }
  articleGroups[articleGroup.id] = dotprop.set(articleGroup, 'articles', []);
  updatedRoundup = dotprop.set(updatedRoundup, 'entities.articleGroups', articleGroups);
  return updatedRoundup;
}

export function deleteArticleGroup(roundup, articleGroup) {
  let updatedRoundup = roundup;

  // Update Lookups
  const articleGroupsLookup = dotprop.get(roundup, `entities.roundups.${roundup.result}.articleGroups`);
  updatedRoundup = dotprop.set(
    updatedRoundup,
    `entities.roundups.${roundup.result}.articleGroups`,
    articleGroupsLookup.filter(x => x !== articleGroup.id)
  );

  // Update Entity
  updatedRoundup = dotprop.delete(updatedRoundup, `entities.articleGroups.${articleGroup.id}`);
  return updatedRoundup;
}

export function updateArticleGroup(roundup, articleGroup) {
  let updatedRoundup = roundup;

  // Update Entity
  // Update Target ArticleGroup
  let articleGroups = dotprop.get(roundup, 'entities.articleGroups');
  const oldArticleGroup = articleGroups[articleGroup.id];
  articleGroups[articleGroup.id] = dotprop.set(articleGroup, 'articles', oldArticleGroup.articles);
  updatedRoundup = dotprop.set(updatedRoundup, 'entities.articleGroups', articleGroups); 

  // Swap Article Group orders if order was changed
  if (articleGroup.roundup_order !== oldArticleGroup.roundup_order) {
    const swapArticleGroup = Object.values(articleGroups).find(x => x.roundup_order === articleGroup.roundup_order && x.id !== articleGroup.id);
    updatedRoundup =  dotprop.set(updatedRoundup, `entities.articleGroups.${swapArticleGroup.id}.roundup_order`, oldArticleGroup.roundup_order);

    articleGroups = dotprop.get(updatedRoundup, 'entities.articleGroups');
    const articleGroupsSortedArr = Object.values(articleGroups).sort((a, b) => {
      if (a.roundup_order > b.roundup_order) {
        return 1;
      } else if (a.roundup_order < b.roundup_order) {
        return -1;
      }
      return 0;
    });
    // Update Lookups
    updatedRoundup = dotprop.set(updatedRoundup, `entities.roundups.${roundup.result}.articleGroups`, articleGroupsSortedArr.map(x => x.id));
  }

  return updatedRoundup;
}
