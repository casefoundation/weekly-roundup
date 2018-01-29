const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const Roundup = require('./Roundup');

bookshelf.plugin('virtuals');

const Recipient = module.exports = bookshelf.Model.extend({
  tableName: 'recipient',
  hasTimestamps: true,
  roundup: function () {
    return this.belongsTo(Roundup);
  },
  virtuals: {

  },
},
{
});
