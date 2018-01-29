const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const ArticleGroup = require('./ArticleGroup');
const Recipient = require('./Recipient');

bookshelf.plugin('virtuals');
bookshelf.plugin('pagination');

const Roundup = module.exports = bookshelf.Model.extend({
  tableName: 'roundup',
  hasTimestamps: true,
  articleGroups: function () {
    return this.hasMany(ArticleGroup);
  },
  recipients: function () {
    return this.hasMany(Recipient);
  },
  virtuals: {
    to: function () {
      return this.related('recipients').filter(x => x.get('type') === 'to');
    },
    cc: function () {
      return this.related('recipients').filter(x => x.get('type') === 'cc');
    },
  },
},
{
  ById: function (id, transacting) {
    return this.forge().query({
      where: {
        id,
        active: true,
      },
    })
      .fetch({
        withRelated: [
          { articleGroups: (query) => { query.where({ active: true }); } },
          { recipients: (query) => { query.where({ active: true }); } },
          { 'articleGroups.articles': (query) => { query.where({ active: true }); } },
        ],
        transacting,
      });
  },
  ByUserId: function (user_id, page, transacting) {
    return this.forge().query({
      where: {
        user_id,
        active: true,
      },
    })
      .fetchPage({
        pageSize: 10,
        page,
        withRelated: [
          { articleGroups: (query) => { query.where({ active: true }); } },
          { recipients: (query) => { query.where({ active: true }); } },
          { 'articleGroups.articles': (query) => { query.where({ active: true }); } },
        ],
        transacting,
      });
  },
  Create: function (user_id) {
    return bookshelf.transaction((t) => {
      // Find User's most recent roundup
      return Roundup.ByUserId(user_id)
        .then((results) => {          
          // Create new roundup
          const roundup = new Roundup({
            user_id,
          });
          return roundup.save(null, { transacting: t })
            .then((saved) => {
              const promises = [];
              // Add recipients of most recent roundup
              if (results.models.length > 0) {
                results.models[0].related('recipients').forEach(r => {
                  const rClone = new Recipient({
                    email: r.get('email'),
                    type: r.get('type'),
                    roundup_id: saved.get('id'),
                  });
                  promises.push(rClone.save(null, { transacting: t }));
                });
              }
              // Return new roundup
              return Promise.all(promises)
                .then(() => {
                  return Roundup.ById(saved.get('id'), t);
                });
            });
        });
    });
  },
  Update: function (user_id, roundup_id, subject, to, cc) {
    return bookshelf.transaction((t) => {
      return Roundup.ById(roundup_id)
        .then((result) => {
          if (!result) {
            throw new Error('Invalid Roundup');
          } else if (result.get('user_id') !== user_id) {
            throw new Error('Unauthorized User');
          }
          // Update meta
          result.set('subject', subject);
          return result.save(null, { transacting: t })
            .then(() => {
              // Update diff of recipients
              return Roundup.UpdateDiffRecipients(t, result, to, cc)
                .then(() => {
                  return Roundup.ById(roundup_id, t);
                });
            });
        });
    });
  },
  UpdateDiffRecipients: function (transacting, roundup, to = [], cc = []) {
    const promises = [];
    const toHash = {};
    const ccHash = {};
    const roundupToHash = {};
    const roundupCcHash = {};
    // Build lookup hashes
    to.forEach(t => { toHash[t] = true; });
    cc.forEach(c => { ccHash[c] = true; });
    roundup.get('to').forEach(t => { roundupToHash[t.email] = true; });
    roundup.get('cc').forEach(c => { roundupCcHash[c.email] = true; });
    // Perform diff on recipients to save/destroy
    roundup.get('to').forEach((t) => {
      if (!to[t.email]) {
        promises.push(t.destroy({ transacting }));
      }
    });
    roundup.get('cc').forEach((c) => {
      if (!cc[c.email]) {
        promises.push(c.destroy({ transacting }));
      }
    });
    to.forEach((t) => {
      if (!roundupToHash[t]) {
        const r = new Recipient({
          email: t,
          roundup_id: roundup.get('id'),
          type: 'to',
        });
        promises.push(r.save(null, { transacting }));
      }
    });
    cc.forEach((c) => {
      if (!roundupCcHash[c]) {
        const r = new Recipient({
          email: c,
          roundup_id: roundup.get('id'),
          type: 'cc',
        });
        promises.push(r.save(null, { transacting }));
      }
    });
    return Promise.all(promises);
  },
});
