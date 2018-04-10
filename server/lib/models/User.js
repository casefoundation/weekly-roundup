require('dotenv').config();
const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

bookshelf.plugin('virtuals');
bookshelf.plugin('pagination');

const User = module.exports = bookshelf.Model.extend({
  tableName: 'user',
  hasTimestamps: true,
  verifyPassword: function (password) {
    return bcrypt.compareSync(password, this.get('password'));
  },
  setPassword: function (password) {
    this.set('password', bcrypt.hashSync(password, 10));
  },
  resetAccount: function () {
    this.set('reset_code', uuidv4());
    this.set('reset_expiration', new Date(new Date(Date.now()).getTime() + (1000 * 60 * 60 * 24)));
  },
  isAdmin: function () {
    return this.get('role') === 'admin';
  },
  getUserPermissions: function (user) {
    if (this.isAdmin() || user.get('id') === this.get('id')) {
      return {
        view: true,
        edit: true,
      };
    }
    return {
      view: false,
      edit: false,
    };
  },
  toJSON: function (options) {
    const sendOpts = options ? Object.assign(options, {
      virtuals: true,
    }) : {
      virtuals: true,
    };
    const json = bookshelf.Model.prototype.toJSON.apply(this, sendOpts);
    json.active = json.active || json.active === 1;
    delete json.password;
    delete json.reset_code;
    delete json.reset_expiration;
    return json;
  },
  virtuals: {

  },
},
{
  byEmail: function (email) {
    return this.forge().query({
      where: {
        email,
      },
    }).fetch();
  },
  byCode: function (code) {
    return this.forge()
      .query((qb) => {
        qb.where('reset_code', code);
        qb.where('reset_expiration', '>=', new Date(Date.now()));
      })
      .fetch();
  },
  byId: function (id) {
    return this.forge().query({
      where: {
        id,
      },
    }).fetch();
  },
  byIds: function (ids) {
    return this.forge().query((qb) => qb.whereIn('id', ids)).fetchAll();
  },
  all: function (page) {
    if (page) {
      return this.forge().query({
        where: {
          active: true,
        },
      })
        .orderBy('email', 'ASC')
        .fetchPage({
          pageSize: 10,
          page,
        });
    }
    return this.forge().query({
      where: {
        active: true,
      },
    })
      .orderBy('email', 'ASC').fetchAll();
  },
  countAll: function () {
    return this.forge().query({
      where: {
        active: true,
      },
    }).count('id');
  },
  seedAdmin: function () {
    return this.forge()
      .query({
        where: {
          role: 'admin',
        },
      })
      .fetchAll()
      .then((users) => {
        if (!users || users.length === 0) {
          const user = new User({
            email: process.env.ADMIN_EMAIL,
            role: 'admin',
            active: true,
          });
          const password = process.env.ADMIN_PASSWORD;
          user.setPassword(password);
          return user.save().then(() => {
            console.log(
              `Seeded an admin user:
                Email: ${user.get('email')}
                Password: ${password}`
            );
          });
        }
      });
  },
});
