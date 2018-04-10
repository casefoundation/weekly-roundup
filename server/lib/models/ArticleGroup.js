const Promise = require('bluebird');
const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const Article = require('./Article');
const Roundup = require('./Roundup');

bookshelf.plugin('virtuals');

const ArticleGroup = module.exports = bookshelf.Model.extend({
  tableName: 'article_group',
  hasTimestamps: true,
  articles: function () {
    return this.hasMany(Article);
  },
  roundup: function () {
    return this.belongsTo(Roundup);
  },
  virtuals: {

  },
},
{
  ById: function (id, transacting) {
    return this.forge().query({
      where: {
        id,
      },
      transacting,
    })
      .fetch({
        withRelated: ['articles'],
      });
  },
  Delete: function (id) {
    return bookshelf.transaction(transacting => {
      return ArticleGroup.ById(id)
        .then((result) => {
          result.set('active', false);
          return result.save(null, { transacting })
            .then(() => {
              // Set all related articles to inactive
              return Promise.map(result.related('articles').models, article => {
                article.set('active', false);
                return article.save(null, { transacting });
              })
                .then(() => {
                  return result;
                });
            });
        });
    });
  },
  Update: function (id, name, roundup_order_shift) {
    return bookshelf.transaction(transacting => {
      return ArticleGroup.ById(id, transacting)
        .then((articleGroup) => {
          const oldOrder = articleGroup.get('roundup_order');
          let swapOrder = oldOrder;

          // Swap roundup order accordingly
          let p = Promise.resolve();
          if (roundup_order_shift !== 0) {
            // Swap order with neighbor according to order shift direction
            const compareOperator = roundup_order_shift < 0 ? '<' : '>';
            const orderbyDirection = roundup_order_shift < 0 ? 'DESC' : 'ASC';
            p = this.forge()
              .query((qb) => {
                qb.where('roundup_order', compareOperator, oldOrder)
                  .andWhere('roundup_id', articleGroup.get('roundup_id'))
                  .andWhere('active', true)
                  .orderBy('roundup_order', orderbyDirection);
              })
              .fetchAll({ transacting })
              .then((results) => {
                if (results.models.length > 0) {
                  // Swap with immediate neighbor
                  const swapArticleGroup = results.models[0];
                  swapOrder = swapArticleGroup.get('roundup_order');
                  swapArticleGroup.set('roundup_order', oldOrder);
                  return swapArticleGroup.save(null, { transacting });
                }
                return false;
              });   
          }

          // Save Updates
          return p.then(() => {
            articleGroup.set('name', name);
            articleGroup.set('roundup_order', swapOrder);
            return articleGroup.save(null, { transacting })
              .then((updated) => {
                return updated;
              });
          });
        });
    });
  },
});
