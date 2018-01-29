const Article = require('../models/Article');
const formatResponse = require('./util').formatResponse;
const scrape = require('../scraper').scrape;

const create = (req, res, next) => {
  let scrapeErrors;
  const url = req.body.url;
  const articlePromise =
    scrape(url)
      .then((metadata) => {
        return new Article({
          title: metadata.title,
          source: metadata.source,
          published: metadata.published,
          summary: metadata.summary,
          url,
          article_group_id: req.body.article_group_id,
          group_order: req.body.group_order,
        });
      })
      .catch((error) => {
        console.log(error);
        scrapeErrors = error;
        return new Article({
          url,
          article_group_id: req.body.article_group_id,
          group_order: req.body.group_order,
        });
      });
        
  articlePromise.then((article) => {
    article.save()
      .then((saved) => {
        Article.ById(saved.id)
          .then((newArticle) => {
            res.json(formatResponse(newArticle, scrapeErrors));
          });
      })
      .catch((err) => {
        next(err);
      });
  });
};

const remove = (req, res, next) => {
  Article.ById(req.body.id)
    .then((result) => {
      if (result) {
        result.set('active', false);
        result.save()
          .then(() => {
            res.json(formatResponse(result));
          });
      } else {
        res.json(formatResponse());
      }
    })
    .catch((err) => {
      next(err);
    });
};

const update = (req, res, next) => {
  Article.ById(req.body.id)
    .then((article) => {
      if (req.body.hasOwnProperty('title')) {
        article.set('title', req.body.title);
      }
      if (req.body.hasOwnProperty('source')) {
        article.set('source', req.body.source);
      }
      if (req.body.hasOwnProperty('published')) {
        article.set('published', req.body.published);
      }
      if (req.body.hasOwnProperty('summary')) {
        article.set('summary', req.body.summary);
      }
      if (req.body.hasOwnProperty('url')) {
        article.set('url', req.body.url);
      }
      if (req.body.hasOwnProperty('article_group_id')) {
        article.set('article_group_id', req.body.article_group_id);
      }
      if (req.body.hasOwnProperty('group_order')) {
        article.set('group_order', req.body.group_order);
      }
      article.save()
        .then((updated) => {
          res.json(formatResponse(updated));
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.init = (app, authenticate) => {
  app.put('/api/article', authenticate, create);
  app.post('/api/article/remove', authenticate, remove);
  app.post('/api/article', authenticate, update);
};
