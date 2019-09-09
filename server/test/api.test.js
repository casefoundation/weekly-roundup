require('dotenv').config();
const chaiHttp = require('chai-http');
const chai = require('chai');
const web = require('../lib/web');
const database = require('../lib/database');
const User = require('../lib/models/User');

const expect = chai.expect;
const server = 'http://localhost:8000';
chai.use(chaiHttp);

let token;

describe('Integration Tests', () => {
  before((done) => {
    database.init()
      .then(() => User.seedAdmin())
      .then(() => web.init(true))
      .then(() => done());
  });

  after((done) => {
    web.close().then(() => done());
  });

  describe('User', () => {
    let newuserid;

    describe('/POST login', () => {
      it('logs in', (done) => {
        chai.request(server)
          .post('/api/user/login')
          .send({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('token');
            token = `Bearer ${res.body.data.token}`;
            done();
          });
      });
    });

    describe('/PUT user', () => {
      it('add user', (done) => {
        chai.request(server)
          .put('/api/user')
          .set('Authorization', token)
          .send({
            email: 'test@test.com',
            password: 'testtest',
            role: 'user',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('email');
            expect(res.body.data).to.have.property('role');
            expect(res.body.data.email).to.equal('test@test.com');
            expect(res.body.data.role).to.equal('user');
            newuserid = res.body.data.id;
            done();
          });
      });
    });

    describe('/POST user', () => {
      it('edit user', (done) => {
        chai.request(server)
          .post('/api/user')
          .set('Authorization', token)
          .send({
            id: newuserid,
            email: 'test@test.com',
            role: 'admin',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('email');
            expect(res.body.data).to.have.property('role');
            expect(res.body.data.email).to.equal('test@test.com');
            expect(res.body.data.role).to.equal('admin');
            expect(res.body.data.id).to.equal(newuserid);
            done();
          });
      });

      it('delete user', (done) => {
        chai.request(server)
          .post('/api/user/remove')
          .set('Authorization', token)
          .send({
            id: newuserid,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('id');
            expect(res.body.data.id).to.equal(newuserid);
            chai.request(server)
              .get(`/api/user/${newuserid}`)
              .set('Authorization', token)
              .send()
              .end((err2, res2) => {
                expect(res2).to.have.status(200);
                expect(res2.body.error).to.be.a('string');
                expect(res2.body.error).to.not.equal(null);
                done();
              });
          });
      });
    });
  });

  describe('Roundup', () => {
    let roundupid;
    let articlegroupid;
    let articleid;
    
    describe('/PUT roundup', () => {
      it('adds new roundup', (done) => {
        chai.request(server)
          .put('/api/roundup')
          .set('Authorization', token)
          .send()
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('subject');
            expect(res.body.data).to.have.property('articleGroups');
            expect(res.body.data).to.have.property('to');
            expect(res.body.data).to.have.property('cc');
            roundupid = res.body.data.id;
            done();
          });
      });
    });

    describe('/POST roundup', () => {
      it('updates roundup', (done) => {
        chai.request(server)
          .post('/api/roundup')
          .set('Authorization', token)
          .send({
            id: roundupid,
            subject: 'test',
            to: ['test@test.com'],
            cc: ['cctest@test.com'],
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(roundupid);
            expect(res.body.data.to.length).to.equal(1);
            expect(res.body.data.to[0].email).to.equal('test@test.com');
            expect(res.body.data.cc[0].email).to.equal('cctest@test.com');
            expect(res.body.data.subject).to.equal('test');
            done();
          });
      });
    });

    describe('/PUT articlegroup', () => {
      it('adds new article group', (done) => {
        chai.request(server)
          .put('/api/articlegroup')
          .set('Authorization', token)
          .send({
            name: 'test',
            roundup_id: roundupid,
            roundup_order: 0,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('roundup_id');
            expect(res.body.data).to.have.property('roundup_order');
            expect(res.body.data).to.have.property('name');
            expect(res.body.data.roundup_id).to.equal(roundupid);
            expect(res.body.data.roundup_order).to.equal(0);
            expect(res.body.data.name).to.equal('test');
            articlegroupid = res.body.data.id;
            done();
          });
      });
    });

    describe('/POST articlegroup', () => {
      it('updates article group', (done) => {
        chai.request(server)
          .post('/api/articlegroup')
          .set('Authorization', token)
          .send({
            id: articlegroupid,
            name: 'test2',
            roundup_order_shift: 0,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(articlegroupid);
            expect(res.body.data.roundup_order).to.equal(0);
            expect(res.body.data.name).to.equal('test2');
            done();
          });
      });
    });

    describe('/PUT article', () => {
      it('adds new analyzed article', (done) => {
        chai.request(server)
          .put('/api/article')
          .set('Authorization', token)
          .send({
            url: 'http://fortune.com/2017/12/13/philanthropy-impact-investing/',
            group_order: 0,
            article_group_id: articlegroupid,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('title');
            expect(res.body.data).to.have.property('source');
            expect(res.body.data).to.have.property('published');
            expect(res.body.data).to.have.property('summary');
            expect(res.body.data).to.have.property('url');
            expect(res.body.data).to.have.property('article_group_id');
            expect(res.body.data).to.have.property('group_order');
            expect(res.body.data.title).to.equal('How ‘Impact Investing‘ Can Put a Profitable Spin on Charity');
            expect(res.body.data.source).to.equal('Fortune');
            expect(res.body.data.article_group_id).to.equal(articlegroupid);
            articleid = res.body.data.id;
            done();
          });
      }).timeout(60000);
    });

    describe('/POST article', () => {
      it('updates article', (done) => {
        chai.request(server)
          .post('/api/article')
          .set('Authorization', token)
          .send({
            id: articleid,
            title: 'test',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.title).to.equal('test');
            expect(res.body.data.source).to.equal('Fortune');
            expect(res.body.data.id).to.equal(articleid);
            done();
          });
      });
    });

    describe('/POST article/remove', () => {
      it('removes article', (done) => {
        chai.request(server)
          .post('/api/article/remove')
          .set('Authorization', token)
          .send({
            id: articleid,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(articleid);
            chai.request(server)
              .get(`/api/roundup/${roundupid}`)
              .set('Authorization', token)
              .send()
              .end((err2, res2) => {
                expect(res2).to.have.status(200);
                expect(res2.body).to.be.a('object');
                expect(res2.body.data.articleGroups.length).to.equal(1);
                expect(res2.body.data.articleGroups[0].articles.length).to.equal(0);
                done();
              });
          });
      });
    });

    describe('/POST articlegroup/remove', () => {
      it('removes article group', (done) => {
        chai.request(server)
          .post('/api/articlegroup/remove')
          .set('Authorization', token)
          .send({
            id: articlegroupid,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(articlegroupid);
            chai.request(server)
              .get(`/api/roundup/${roundupid}`)
              .set('Authorization', token)
              .send()
              .end((err2, res2) => {
                expect(res2).to.have.status(200);
                expect(res2.body).to.be.a('object');
                expect(res2.body.data.articleGroups.length).to.equal(0);
                done();
              });
          });
      });
    });

    describe('/GET roundup', () => {
      it('gets roundup', (done) => {
        chai.request(server)
          .get(`/api/roundup/${roundupid}`)
          .set('Authorization', token)
          .send()
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(roundupid);
            expect(res.body.data.to.length).to.equal(1);
            expect(res.body.data.to[0].email).to.equal('test@test.com');
            expect(res.body.data.cc[0].email).to.equal('cctest@test.com');
            expect(res.body.data.subject).to.equal('test');
            done();
          });
      });
    });

    describe('/GET roundup/archive', () => {
      it('gets roundup archive', (done) => {
        chai.request(server)
          .get('/api/roundup/archive/1')
          .set('Authorization', token)
          .send()
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data).to.be.a('object');
            expect(res.body.data.roundups).to.be.an('array');
            done();
          });
      });
    });

    describe('/POST roundup/remove', () => {
      it('deletes roundup', (done) => {
        chai.request(server)
          .post('/api/roundup/remove')
          .set('Authorization', token)
          .send({
            id: roundupid,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.data.id).to.equal(roundupid);
            chai.request(server)
              .get(`/api/roundup/${roundupid}`)
              .set('Authorization', token)
              .send()
              .end((err2, res2) => {
                expect(res2).to.have.status(200);
                expect(res2.body).to.be.a('object');
                expect(res2.body.data).to.be.a('null');
                done();
              });
          });
      });
    });
  });
});
