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
  ById: function (id) {
    return this.forge().query({
      where: {
        id,
      },
    })
      .fetch({
        withRelated: ['articles'],
      });
  },
});
