const sqliteConfig = {
  'filename': './database.sqlite'
}

const testSqliteConfig = {
  'filename': './database_test.sqlite'
}

const knex = exports.knex = require('knex')({
  'client': 'sqlite3',
  'connection': process.env.NODE_ENV === 'test' ? testSqliteConfig : sqliteConfig,
  'useNullAsDefault': true
});

exports.init = () => {
  return knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary().notNullable();
        table.string('email',255).unique().notNullable();
        table.string('password',64).notNullable();
        table.string('role',16).notNullable().defaultTo('user');
        table.string('resetCode',36);
        table.datetime('resetExpiration');
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps();
      });
    }
  }).then(() => {
    //TODO other tables
  })
}
