# Setup

## Table of Contents

- [Configuration](#configuration)
- [Test Deployment](#test-deployment)
- [Production Deployment](#production-deployment)
- [Something Missing?](#something-missing)

## Configuration
App Configuration is handled through the server/.env file in the base directory.

### Global Config
*  **NODE_ENV**=[production|test] Use specified configuration 
*  **DB_CLIENT**=[mysql|pg|sqlite3] Use specified DB client
*  **JWT_SECRET**=[string] Use some unique string for js web token
*  **SENDGRID_API_KEY**=[string] SendGrid API Key
*  **ADMIN_EMAIL**=[string] Initial Admin Email added to DB
*  **ADMIN_PASSWORD**=[string] Initial Admin Password
*  **LOGO_URL**=[string] URL to a logo for the email header

### Production config
*  **DB_MYSQL_HOST**=[string] DB host IP
*  **DB_MYSQL_USER**=[string] Mysql User (root)
*  **DB_MYSQL_PASSWORD**=[string] Mysql User Password
*  **DB_MYSQL_DB**=[string] Mysql DB Name
*  **DB_MYSQL_SSL_CA**=[./lib/ssl/server-ca.pem] Location of SSL key
*  **DB_MYSQL_SSL_KEY**=[./lib/ssl/client-key.pem] Location of SSL key
*  **DB_MYSQL_SSL_CERT**=[./lib/ssl/client-cert.pem] Location of SSL key
*  **DB_PG_CONNECTION**=[string] PG connection string
*  **DB_SQLITE3_FILENAME**=[./weeklyroundup.sqlite] Location of sqlite3 file with host config

### Test config
*  **TEST_DB_MYSQL_HOST**=[127.0.0.1] local DB host IP
*  **TEST_DB_MYSQL_USER**=[string] Mysql User (root)
*  **TEST_DB_MYSQL_PASSWORD**=[string] Mysql User Password
*  **TEST_DB_MYSQL_DB**=[string] Mysql DB Name
*  **TEST_DB_MYSQL_SSL_CA**=[./lib/ssl/server-ca.pem] Location of SSL key
*  **TEST_DB_MYSQL_SSL_KEY**=[./lib/ssl/client-key.pem] Location of SSL key
*  **TEST_DB_MYSQL_SSL_CERT**=[./lib/ssl/client-cert.pem] Location of SSL key
*  **TEST_DB_PG_CONNECTION**=[string] PG connection string
*  **TEST_DB_SQLITE3_FILENAME**=[./weeklyroundup.sqlite] Location of sqlite3 file with host config

## Test Deployment

1.  **Initialize DB** - Create DB (remotely or locally) using whichever service you desire (MySQL, Postgres, SQLLite3). Create a database with the desired named (ex: 'weeklyroundup').
2.  **Configure WeeklyRoundup** - Take note of the newly created DB host, user, password, db name, and SSL certs (if applicable), and add to the test configuration in the server/.env file.
3.  **Start Server** - Make sure NODE_ENV=test, navigate to the server/ directory, and run the command 'npm start'.
4.  **Start Client** - Navigate to the client/ directory, and run the command 'npm start'.

## Production Deployment

1.  **Initialize DB** - Create DB (remotely or locally) using whichever service you desire (MySQL, Postgres, SQLLite3). Create a database with the desired named (ex: 'weeklyroundup').
2.  **Configure WeeklyRoundup** - Take note of the newly created DB host, user, password, db name, and SSL certs (if applicable), and add to the production configuration in the server/.env file.
3.  **Push Docker Build** - Using docker, push the build to your server. Make sure NODE_ENV=production if you're pushing to a production server.
