const ArticleGroup = require('../models/ArticleGroup');
const formatResponse = require('./util').formatResponse;

const create = (req, res, next) => {
  // Create new article group
  const articleGroup = new ArticleGroup({
    name: req.body.name,
    roundup_id: req.body.roundup_id,
    roundup_order: req.body.roundup_order,
  });
  articleGroup.save()
    .then((saved) => {
      res.json(formatResponse(saved));
    })
    .catch((err) => {
      next(err);
    });
};

const remove = (req, res, next) => {
  ArticleGroup.ById(req.body.id)
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
  ArticleGroup.ById(req.body.id)
    .then((articleGroup) => {
      articleGroup.set('name', req.body.name);
      articleGroup.set('roundup_order', req.body.roundup_order);
      articleGroup.save()
        .then((updated) => {
          res.json(formatResponse(updated));
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.init = (app, authenticate) => {
  app.put('/api/articlegroup', authenticate, create);
  app.post('/api/articlegroup/remove', authenticate, remove);
  app.post('/api/articlegroup', authenticate, update);
};
