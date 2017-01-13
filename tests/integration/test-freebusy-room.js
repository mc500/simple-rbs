var supertest = require('supertest'),
assert = require('assert'),
commonutil = require('../utils'),
app = require('../../app');

var testData = commonutil.getTestData();

// freebusy test
exports.get_freebusy_room = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: testData.room.roomid,
    start: testData.time.freebusy1.start,
    end:   testData.time.freebusy1.end

  }))
  .expect(200)
  .end(done);
};

exports.get_freebusy_room_unknown_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: 'unknown',
    start: testData.time.freebusy1.start,
    end:   testData.time.freebusy1.end
  }))
  .expect(404)
  .end(done);
};

exports.get_freebusy_room_empty_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    //roomid: testData.room.roomid,
    start: testData.time.freebusy1.start,
    end:   testData.time.freebusy1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_room_empty_start = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: testData.room.roomid,
    //start: testData.time.freebusy1.start,
    end:   testData.time.freebusy1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_room_empty_end = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: testData.room.roomid,
    start: testData.time.freebusy1.start,
    //end:   testData.time.freebusy1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_room_invalid_date1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: testData.room.roomid,
    start: testData.time.invalid1.start,
    end:   testData.time.invalid1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_room_invalid_date2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/room', {
    roomid: testData.room.roomid,
    start: testData.time.invalid2.start,
    end:   testData.time.invalid2.end
  }))
  .expect(400)
  .end(done);
};