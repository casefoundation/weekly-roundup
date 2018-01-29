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
});
