var supertest = require('supertest'),
assert = require('assert'),
commonutil = require('../utils'),
app = require('../../app');

var testData = commonutil.getTestData();

var evtid;

// reservation first
exports.book_reservation = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.based.start,
    end: testData.time.based.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(function(res) {
    // delete it later
    console.log('booked eventid: '+res.body.eventid);
    if (res.body.eventid) {
      evtid = res.body.eventid; 
    }
  })
  .expect(200)
  .end(done);
};

exports.book_reservation_conflict1 = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.conflict1.start,
    end: testData.time.conflict1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(409)
  .end(done);
};

exports.book_reservation_conflict2 = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.conflict2.start,
    end: testData.time.conflict2.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(409)
  .end(done);
};

exports.book_reservation_conflict3 = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.conflict3.start,
    end: testData.time.conflict3.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(409)
  .end(done);
};

exports.book_reservation_conflict4 = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.conflict4.start,
    end: testData.time.conflict4.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(409)
  .end(done);
};

exports.book_reservation_empty_userinfo = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    //user: testData.user
  })
  .expect(400)
  .end(done);
};

exports.book_reservation_empty_roomid = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    //roomid: testData.room.roomid,
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(400)
  .end(done);
};

exports.book_reservation_empty_start = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    //start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(400)
  .end(done);
};

exports.book_reservation_empty_end = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.available1.start,
    //end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(400)
  .end(done);
};

exports.book_reservation_empty_purpose = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    //purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(400)
  .end(done);
};

exports.book_reservation_empty_userid = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    'user': {
      // 'userid': testData.user.userid,
      'name': testData.user.name,
      'email': testData.user.email,
      'phone': testData.user.phone
    }
  })
  .expect(400)
  .end(done);
};

/* Can not validate userid is known user or not
exports.book_reservation_unknown_userid = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: testData.room.roomid,
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: {
      'userid': 'unknown',
      'name': testData.user.name,
      'email': testData.user.email,
      'phone': testData.user.phone
    }
  })
  .expect(404)
  .end(done);
};
*/

exports.book_reservation_unknown_roomid = function(done){
  supertest(app)
  .post(commonutil.buildURL('/book'))
  .send({
    roomid: 'unknown',
    start: testData.time.available1.start,
    end: testData.time.available1.end,
    purpose: testData.room.purpose,
    attendees: testData.room.attendees,
    user: testData.user
  })
  .expect(404)
  .end(done);
};

// get reservation test
exports.get_reservation_info = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book', {
    eventid: evtid,
    roomid: testData.room.roomid
  }))
  .expect(200)
  .end(done);
};

exports.get_reservation_empty_eventid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book', {
    //eventid: evtid,
    roomid: testData.room.roomid
  }))
  .expect(400)
  .end(done);
};

exports.get_reservation_empty_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book', {
    //eventid: evtid,
    roomid: testData.room.roomid
  }))
  .expect(400)
  .end(done);
};

exports.get_reservation_invalid_eventid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book', {
    eventid:'unknown',
    roomid: testData.room.roomid
  }))
  .expect(404)
  .end(done);
};

exports.get_reservation_invalid_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book', {
    eventid: evtid,
    roomid: 'unknown'
  }))
  .expect(404)
  .end(done);
};

// search by site
exports.search_by_site = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: testData.site.siteid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(200)
  .end(done);
};

exports.search_by_site_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    //siteid: testData.site.siteid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_site_empty_start = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: testData.site.siteid,
    //start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_site_empty_end = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: testData.site.siteid,
    start: testData.time.search1.start,
    //end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_site_invalid_date1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: testData.site.siteid,
    start: testData.time.invalid1.start,
    end: testData.time.invalid1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_site_invalid_date2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: testData.site.siteid,
    start: testData.time.invalid2.start,
    end: testData.time.invalid2.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_site_unknown_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/bysite', {
    siteid: 'unknown',
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(404)
  .end(done);
};


// search by user
exports.search_by_user = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: testData.site.siteid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(200)
  .end(done);
};

exports.search_by_user_empty_userid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    //userid: testData.user.userid,
    siteid: testData.site.siteid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_empty_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    //siteid: testData.site.siteid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_empty_start = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: testData.site.siteid,
    //start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_empty_end = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: testData.site.siteid,
    start: testData.time.search1.start,
    //end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_invalid_date1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: testData.site.siteid,
    start: testData.time.invalid1.start,
    end: testData.time.invalid1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_invalid_date2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: testData.site.siteid,
    start: testData.time.invalid2.start,
    end: testData.time.invalid2.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_user_unknown_siteid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byuser', {
    userid: testData.user.userid,
    siteid: 'unknown',
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(404)
  .end(done);
};

// search by room
exports.search_by_room = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: testData.room.roomid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(200)
  .end(done);
};

exports.search_by_room_empty_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    //roomid: testData.room.roomid,
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_room_empty_start = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: testData.room.roomid,
    //start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_room_empty_end = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: testData.room.roomid,
    start: testData.time.search1.start,
    //end: testData.time.search1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_room_invalid_date1 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: testData.room.roomid,
    start: testData.time.invalid1.start,
    end: testData.time.invalid1.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_room_invalid_date2 = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: testData.room.roomid,
    start: testData.time.invalid2.start,
    end: testData.time.invalid2.end
  }))
  .expect(400)
  .end(done);
};

exports.search_by_room_unknown_roomid = function(done){
  supertest(app)
  .get(commonutil.buildURL('/book/search/byroom', {
    roomid: 'unknown',
    start: testData.time.search1.start,
    end: testData.time.search1.end
  }))
  .expect(404)
  .end(done);
};

//
exports.cancel_reservation = function(done){
  supertest(app)
  .del(commonutil.buildURL('/book', {
    'eventid': evtid,
    roomid: testData.room.roomid,
    userid: testData.user.userid,
  }))
  .expect(200)
  .end(done);
};