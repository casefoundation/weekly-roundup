require('dotenv').config();
const assert = require('chai').assert;

const db = require('../lib/database');

describe('db init test', () => {
  before(() => 
    db.init()
  );

  it('has user table', () =>
    db.knex.schema.hasTable('user')
      .then((exists) => assert.equal(exists, true))
  );

  it('has roundup table', () => 
    db.knex.schema.hasTable('roundup')
      .then((exists) => assert.equal(exists, true))
  );

  it('has article_group table', () => 
    db.knex.schema.hasTable('article_group')
      .then((exists) => assert.equal(exists, true))
  );

  it('has article table', () =>
    db.knex.schema.hasTable('article')
      .then((exists) => assert.equal(exists, true))
  );

  it('has recipient table', () =>
    db.knex.schema.hasTable('recipient')
      .then((exists) => assert.equal(exists, true))
  );
});
