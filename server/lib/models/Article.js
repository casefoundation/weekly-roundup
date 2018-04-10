const Promise = require('bluebird');
const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const ArticleGroup = require('./ArticleGroup');

bookshelf.plugin('virtuals');

const Article = module.exports = bookshelf.Model.extend({
  tableName: 'article',
  hasTimestamps: true,
  articleGroup: function () {
    return this.belongsTo(ArticleGroup);
  },
  virtuals: {

  },
},
{
  ById: function (id) {
    return this.forge().query({
      where: {
        id,
      },
    })
      .fetch();
  },
  Update: function (id, title, source, published, summary, url, article_group_id, group_order_shift) {
    return bookshelf.transaction(transacting => {
      return Article.ById(id, transacting)
        .then((article) => {
          const oldOrder = article.get('group_order');
          let swapOrder = oldOrder;

          // Swap group order accordingly
          let p = Promise.resolve();
          if (group_order_shift !== 0) {
            // Swap order with neighbor according to order shift direction
            const compareOperator = group_order_shift < 0 ? '<' : '>';
            const orderbyDirection = group_order_shift < 0 ? 'DESC' : 'ASC';
            p = this.forge()
              .query((qb) => {
                qb.where('group_order', compareOperator, oldOrder)
                  .andWhere('article_group_id', article.get('article_group_id'))
                  .andWhere('active', true)
                  .orderBy('group_order', orderbyDirection);
              })
              .fetchAll({ transacting })
              .then((results) => {
                if (results.models.length > 0) {
                  // Swap with immediate neighbor
                  const swapArticle = results.models[0];
                  swapOrder = swapArticle.get('group_order');
                  swapArticle.set('group_order', oldOrder);
                  return swapArticle.save(null, { transacting });
                }
                return false;
              });   
          }

          // Save Updates
          return p.then(() => {
            if (title) {
              article.set('title', title);
            }
            if (source) {
              article.set('source', source);
            }
            if (published) {
              article.set('published', published);
            }
            if (summary) {
              article.set('summary', summary);
            }
            if (url) {
              article.set('url', url);
            }
            if (article_group_id) {
              article.set('article_group_id', article_group_id);
            }
            if (swapOrder) {
              article.set('group_order', swapOrder);
            }
            return article.save(null, { transacting })
              .then((updated) => {
                return updated;
              });
          });
        });
    });
  },
});
