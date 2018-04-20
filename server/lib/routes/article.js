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
          published: metadata.published && metadata.published !== '' ? new Date(metadata.published) : null,
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
  Article.Update(
    req.body.id,
    req.body.title,
    req.body.source,
    req.body.published,
    req.body.summary,
    req.body.url,
    req.body.article_group_id,
    req.body.group_order_shift)
    .then((updated) => {
      res.json(formatResponse(updated));
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
