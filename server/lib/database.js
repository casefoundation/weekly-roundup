const fs = require('fs');

const dbConfig = {
  test: {
    mysql: {
      client: 'mysql',
      connection: {
        host: process.env.TEST_DB_MYSQL_HOST,
        user: process.env.TEST_DB_MYSQL_USER,
        password: process.env.TEST_DB_MYSQL_PASSWORD,
        database: process.env.TEST_DB_MYSQL_DB,
      },
      useNullAsDefault: true,
    },
    pg: {
      client: 'pg',
      connection: process.env.TEST_DB_PG_CONNECTION,
      useNullAsDefault: true,
    },
    sqlite3: {
      client: 'sqlite3',
      connection: {
        filename: process.env.TEST_DB_SQLITE3_FILENAME,
      },
      useNullAsDefault: true,
    },
  },
  
  production: {
    mysql: {
      client: 'mysql',
      connection: {
        host: process.env.DB_MYSQL_HOST,
        user: process.env.DB_MYSQL_USER,
        password: process.env.DB_MYSQL_PASSWORD,
        database: process.env.DB_MYSQL_DB,
      },
      useNullAsDefault: true,
    },
    pg: {
      client: 'pg',
      connection: process.env.DB_PG_CONNECTION,
      useNullAsDefault: true,
    },
    sqlite3: {
      client: 'sqlite3',
      connection: {
        filename: process.env.DB_SQLITE3_FILENAME,
      },
      useNullAsDefault: true,
    },
  },
};

// SSL Config for Test
if (process.env.TEST_DB_MYSQL_SSL_CA) {
  dbConfig.test.mysql.connection.ssl = {
    ca: process.env.TEST_DB_MYSQL_SSL_CA ? fs.readFileSync(process.env.TEST_DB_MYSQL_SSL_CA) : null, // should be enough for AWS
    key: process.env.TEST_DB_MYSQL_SSL_KEY ? fs.readFileSync(process.env.TEST_DB_MYSQL_SSL_KEY) : null, // required for google mysql cloud db
    cert: process.env.TEST_DB_MYSQL_SSL_CERT ? fs.readFileSync(process.env.TEST_DB_MYSQL_SSL_CERT) : null, // required for google mysql cloud db
  };
}

// SSL Config for Production
if (process.env.DB_MYSQL_SSL_CA) {
  dbConfig.production.mysql.connection.ssl = {
    ca: process.env.DB_MYSQL_SSL_CA ? fs.readFileSync(process.env.DB_MYSQL_SSL_CA) : null, // should be enough for AWS
    key: process.env.DB_MYSQL_SSL_KEY ? fs.readFileSync(process.env.DB_MYSQL_SSL_KEY) : null, // required for google mysql cloud db
    cert: process.env.DB_MYSQL_SSL_CERT ? fs.readFileSync(process.env.DB_MYSQL_SSL_CERT) : null, // required for google mysql cloud db
  };
}

function createUserTable(knexObj) {
  return knexObj.schema.createTable('user', (table) => {
    table.increments('id').primary().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password', 64).notNullable();
    table.string('role', 16).notNullable().defaultTo('user');
    table.string('signature', 512);
    table.string('reset_code', 36);
    table.datetime('reset_expiration');
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps();
  });
}

function createRoundupTable(knexObj) {
  return knexObj.schema.createTable('roundup', (table) => {
    table.increments('id').primary().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('user.id');
    table.string('subject', 255);
    table.string('preface', 4166);
    table.datetime('date_sent');
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps();
  });
}

function createArticleGroupTable(knexObj) {
  return knexObj.schema.createTable('article_group', (table) => {
    table.increments('id').primary().notNullable();
    table.string('name', 255).notNullable();
    table.integer('roundup_id').unsigned().notNullable();
    table.foreign('roundup_id').references('roundup.id');
    table.integer('roundup_order').unsigned().notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps();
  });
}

function createArticleTable(knexObj) {
  return knexObj.schema.createTable('article', (table) => {
    table.increments('id').primary().notNullable();
    table.integer('article_group_id').unsigned().notNullable();
    table.foreign('article_group_id').references('article_group.id');
    table.string('title', 255);
    table.string('source', 255);
    table.dateTime('published');
    table.string('summary', 4166);
    table.string('url', 2083);
    table.integer('group_order').unsigned().notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps();
  });
}

function createRecipientTable(knexObj) {
  return knexObj.schema.createTable('recipient', (table) => {
    table.increments('id').primary().notNullable();
    table.integer('roundup_id').unsigned().notNullable();
    table.foreign('roundup_id').references('roundup.id');
    table.string('email', 255).notNullable();
    table.string('type', 16).notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps();
  });
}

const knex = exports.knex = require('knex')(dbConfig[process.env.NODE_ENV][process.env.DB_CLIENT]);

exports.init = () =>
  knex.schema.hasTable('user').then((exists) => {
    if (!exists) {
      return createUserTable(knex);
    }
  })
    .then(() =>
      knex.schema.hasTable('roundup').then((exists) => {
        if (!exists) {
          return createRoundupTable(knex);
        }
      })
        .then(() =>
          knex.schema.hasTable('article_group').then((exists) => {
            if (!exists) {
              return createArticleGroupTable(knex);
            }
          })
            .then(() =>
              knex.schema.hasTable('article').then((exists) => {
                if (!exists) {
                  return createArticleTable(knex);
                }
              })
                .then(() =>
                  knex.schema.hasTable('recipient').then((exists) => {
                    if (!exists) {
                      return createRecipientTable(knex);
                    }
                  })
                )
            )
        )
    );
