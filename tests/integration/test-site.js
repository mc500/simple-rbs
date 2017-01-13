var supertest = require('supertest'),
assert = require('assert'),
commonutil = require('../utils'),
app = require('../../app');

var testData = commonutil.getTestData();

// get site test
exports.get_site_info = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site', {
    siteid: testData.site.siteid
  }))
  .expect(200)
  .end(done);
};

exports.get_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site'))
  .expect(400)
  .end(done);
};

exports.get_invalid_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site', {siteid:'unknown'}))
  .expect(404)
  .end(done);
};

/*
// create site test
exports.create_site = function(done){
  after(function(){
    // Delete Site
    supertest(app)
    .post(commonutil.buildURL('/site'))
    .send({
      'siteid': '1IFC',
      'location': 'Seoul/Korea'
    })
    .end(done);
  });

  // Test
  supertest(app)
  .post(commonutil.buildURL('/site'))
  .send({
    'siteid': '1IFC',
    'location': 'Seoul/Korea'
  })
  .expect(200)
  .end(done);
};
*/

exports.get_site_list = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/list'))
  .expect(200)
  .end(done);
};

exports.get_site_rooms = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms', {
    siteid: testData.site.siteid
  }))
  .expect(200)
  .end(done);
};

exports.get_site_rooms_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms', {
    //siteid: testData.site.siteid
  }))
  .expect(400)
  .end(done);
};

exports.get_site_rooms_invalid_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms', {
    siteid: 'unknown'
  }))
  .expect(404)
  .end(done);
};

exports.get_site_rooms_byfloor = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms/byfloor', {
    siteid: testData.site.siteid,
    floor: testData.room.floor,
  }))
  .expect(200)
  .end(done);
};

exports.get_site_rooms_byfloor_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms/byfloor', {
    //siteid: testData.site.siteid,
    floor: testData.room.floor,
  }))
  .expect(400)
  .end(done);
};

exports.get_site_rooms_byfloor_empty_floor = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms/byfloor', {
    siteid: testData.site.siteid,
    //floor: testData.room.floor,
  }))
  .expect(400)
  .end(done);
};

exports.get_site_rooms_byfloor_invalid_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms/byfloor', {
    siteid: 'unknown',
    floor: testData.room.floor,
  }))
  .expect(404)
  .end(done);
};

exports.get_site_rooms_byfloor_invalid_floor = function(done){
  supertest(app)
  .get(commonutil.buildURL('/site/rooms/byfloor', {
    siteid: testData.site.siteid,
    floor: 'invalid',
  }))
  .expect(400)
  .end(done);
};