const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const randomstring = require('randomstring');
bookshelf.plugin('virtuals');

const User = module.exports = bookshelf.Model.extend({
  'tableName': 'users',
  'hasTimestamps': true,
  'verifyPassword': function(password) {
    return bcrypt.compareSync(password,this.get('password'));
  },
  'setPassword': function(password) {
    this.set('password',bcrypt.hashSync(password,10));
  },
  'resetAccount': function() {
    this.set('resetCode',uuidv4());
    this.set('resetExpiration', new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));
    return this.save()
      .then(() => {
        //TODO send reset email
      });
  },
  'isAdmin': function() {
    return this.get('role') === 'admin';
  },
  'getUserPermissions': function(user) {
    if (this.isAdmin() || user.get('id') === this.get('id')) {
      return {
        'view': true,
        'edit': true
      };
    } else {
      return {
        'view': false,
        'edit': false
      };
    }
  },
  'toJSON': function(options) {
    const sendOpts = options ? Object.assign(options,{'virtuals': true}) : {'virtuals': true};
    const json = bookshelf.Model.prototype.toJSON.apply(this,sendOpts);
    json.active = json.active === true || json.active === 1;
    delete json.password;
    delete json.resetCode;
    delete json.resetExpiration;
    return json;
  },
  'virtuals': {

  }
}, {
  'byEmail': function(email) {
    return this.forge().query({where:{ email: email }}).fetch({'withRelated':'reviews'});
  },
  'byCode': function(code) {
    return this.forge()
      .query((qb) => {
        qb.where('resetCode',code);
        qb.where('resetExpiration','>=',new Date());
      })
      .fetch()
  },
  'byId': function(id) {
    return this.forge().query({where:{ id: id }}).fetch({'withRelated':['reviews']});
  },
  'byIds': function(ids) {
    return this.forge().query((qb) => qb.whereIn('id',ids)).fetchAll({'withRelated':'reviews'});
  },
  'all': function() {
    return this.forge().fetchAll({'withRelated':'reviews'});
  },
  'seedAdmin': function() {
    return this.forge()
      .query({'where':{'role':'admin'}})
      .fetchAll()
      .then((users) => {
        if (!users || users.length == 0) {
          const user = new User({
            'email': 'johnj@casefoundation.org',
            'role': 'admin',
            'active': true
          });
          const password = randomstring.generate();
          user.setPassword(password)
          return user.save().then(() => {
            console.log('Seeded an admin user:\nEmail: ' + user.get('email') + '\nPassword: ' + password);
          });
        }
      });
  }
});
