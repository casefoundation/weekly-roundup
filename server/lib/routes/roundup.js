const Roundup = require('../models/Roundup');
const formatResponse = require('./util').formatResponse;
const { formatRoundup } = require('../roundupMailFormatter');

const create = (req, res, next) => {
  Roundup.Create(req.user.id)
    .then((result) => {
      res.json(formatResponse(result));
    })
    .catch((err) => {
      next(err);
    });
};

const remove = (req, res, next) => {
  Roundup.ById(req.body.id)
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
  Roundup.Update(req.user.id, req.body.id, req.body.subject, req.body.to, req.body.cc, req.body.preface)
    .then((updated) => {
      res.json(formatResponse(updated));
    })
    .catch((err) => {
      next(err);
    });
};

const get = (req, res, next) => {
  Roundup.ById(req.params.roundup_id)
    .then((result) => {
      res.json(formatResponse(result));
    })
    .catch((err) => {
      next(err);
    });
};

const preview = (req, res, next) => {
  Roundup.ById(req.params.roundup_id)
    .then((result) => {
      res.send(formatRoundup('/', result.toJSON(), req.user.get('signature')));
    })
    .catch((err) => {
      next(err);
    });
};

const getPage = (req, res, next) => {
  Roundup.ByUserId(req.user.id, req.params.page)
    .then((results) => {
      Roundup.CountByUserId(req.user.id)
        .then((totalCount) => {
          res.json(formatResponse({
            roundups: results,
            totalCount,
          }));
        });
    })
    .catch((err) => {
      next(err);
    });
};

const send = (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  Roundup.SendEmail(baseUrl, req.user, req.body.roundup_id)
    .then(() => {
      res.json(formatResponse({
        message: 'ok',
      }));
    })
    .catch((err) => {
      next(err);
    });
};

exports.init = (app, authenticate) => {
  app.put('/api/roundup', authenticate, create);
  app.get('/api/roundup/:roundup_id/preview', authenticate, preview);
  app.get('/api/roundup/:roundup_id', authenticate, get);
  app.post('/api/roundup', authenticate, update);
  app.post('/api/roundup/remove', authenticate, remove);
  app.get('/api/roundup/archive/:page', authenticate, getPage);
  app.post('/api/roundup/send', authenticate, send);
};
