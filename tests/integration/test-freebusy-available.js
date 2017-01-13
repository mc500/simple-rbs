var supertest = require('supertest'),
assert = require('assert'),
commonutil = require('../utils'),
app = require('../../app');

var testData = commonutil.getTestData();

// freebusy test
exports.get_freebusy_available1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(200)
  .end(done);
};

exports.get_freebusy_available2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.available2.start,
    end:   testData.time.available2.end
  }))
  .expect(200)
  .end(done);
};

exports.get_freebusy_available_unknown_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: 'unknown',
    capacity: testData.room.capacity,
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(404)
  .end(done);
};

exports.get_freebusy_available_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    //siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_empty_capacity = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    //capacity: testData.room.capacity,
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_empty_start = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    //start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_empty_end = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.available1.start,
    //end:   testData.time.available1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_invalid_date1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.invalid1.start,
    end:   testData.time.invalid1.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_invalid_date2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.capacity,
    start: testData.time.invalid2.start,
    end:   testData.time.invalid2.end
  }))
  .expect(400)
  .end(done);
};

exports.get_freebusy_available_invalid_capacity1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.bigCapacity, // oversize
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(function(res) {
    assert(res.body.length == 0);
  })
  .expect(200)
  .end(done);
};

exports.get_freebusy_available_invalid_capacity2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/freebusy/available', {
    siteid: testData.site.siteid,
    capacity: testData.room.invalidCapacity, // less than or equal to zero value
    start: testData.time.available1.start,
    end:   testData.time.available1.end
  }))
  .expect(400)
  .end(done);
};