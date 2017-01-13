var supertest = require('supertest'),
assert = require('assert'),
commonutil = require('../utils'),
app = require('../../app');

var testData = commonutil.getTestData();

// get room test
exports.get_room_info = function(done){
  supertest(app)
  .get(commonutil.buildURL('/room', {
    roomid: testData.room.roomid
  }))
  .expect(200)
  .end(done);
};

exports.get_empty_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/room'))
  .expect(400)
  .end(done);
};

exports.get_invalid_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/room', {roomid:'unknown'}))
  .expect(404)
  .end(done);
};

