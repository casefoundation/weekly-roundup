const sgMail = require('@sendgrid/mail');
const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const ArticleGroup = require('./ArticleGroup');
const Recipient = require('./Recipient');
const { formatRoundup } = require('../roundupMailFormatter');

bookshelf.plugin('virtuals');
bookshelf.plugin('pagination');
bookshelf.plugin(require('bookshelf-cascade-delete'));

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
  dependents: ['articleGroups'],
  ById: function (id, transacting) {
    return this.forge().query({
      where: {
        id,
        active: true,
      },
    })
      .orderBy('created_at', 'ASC')
      .fetch({
        withRelated: [
          { articleGroups: (query) => { query.where({ active: true }).orderBy('roundup_order', 'ASC'); } },
          { recipients: (query) => { query.where({ active: true }); } },
          { 'articleGroups.articles': (query) => { query.where({ active: true }).orderBy('group_order', 'ASC'); } },
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
      .orderBy('created_at', 'ASC')
      .fetchPage({
        pageSize: 10,
        page,
        withRelated: [
          { articleGroups: (query) => { query.where({ active: true }).orderBy('roundup_order', 'ASC'); } },
          { recipients: (query) => { query.where({ active: true }); } },
          { 'articleGroups.articles': (query) => { query.where({ active: true }).orderBy('group_order', 'ASC'); } },
        ],
        transacting,
      });
  },
  CountByUserId: function (user_id, transacting) {
    return this.forge().query({
      where: {
        user_id,
        active: true,
      },
      transacting,
    }).count('id');
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
  SendEmail: function (baseUrl, user, roundup_id) {
    return Roundup.ById(roundup_id)
      .then(roundup => {
        if (roundup.get('user_id') !== user.id) {
          throw new Error('Unauthorized User');
        }
        if (process.env.SENDGRID_API_KEY) {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const to = roundup.get('to').map(x => x.get('email'));
          const cc = roundup.get('cc').map(x => x.get('email'));
          const msg = {
            to,
            from: user.get('email'),
            subject: roundup.get('subject'),
            html: formatRoundup(baseUrl, roundup.toJSON(), user.get('signature')),
          };
          return sgMail.sendMultiple(msg)
            .then(() => {
              roundup.set('date_sent', new Date(Date.now()));
              return roundup.save();
            });
        }
        return roundup.save();
      });
  },
  Update: function (user_id, roundup_id, subject, to, cc, preface) {
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
          result.set('preface', preface);
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
