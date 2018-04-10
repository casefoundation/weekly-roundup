import { schema } from 'normalizr';
import dotprop from 'dot-prop-immutable';
import { ArticleGroupSchema } from './ArticleGroupSchema';

export const RoundupSchema = new schema.Entity('roundups', {
  articleGroups: [ArticleGroupSchema],
});

export function updateRoundup(oldRoundup, newRoundup) {
  let updatedRoundup = oldRoundup;
  updatedRoundup = dotprop.set(updatedRoundup, `entities.roundups.${oldRoundup.result}.subject`, newRoundup.subject);
  updatedRoundup = dotprop.set(updatedRoundup, `entities.roundups.${oldRoundup.result}.to`, newRoundup.to);
  updatedRoundup = dotprop.set(updatedRoundup, `entities.roundups.${oldRoundup.result}.cc`, newRoundup.cc);
  return updatedRoundup;
}
