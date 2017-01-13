/*
var supertest = require('supertest'),
assert = require('assert'),
app = require('../../app');

exports.addition_should_accept_numbers = function(done){
  supertest(app)
  .get('/add?a=1&b=1')
  .expect(200)
  .end(done);
};

exports.addition_should_reject_strings = function(done){
  supertest(app)
  .get('/add?a=string&b=2')
  .expect(422)
  .end(done);
};

exports.addition_should_respond_with_a_numeric_result = function(done){
  supertest(app)
  .get('/subtract?a=5&b=4')
  .expect(200)
  .end(function(err, response){
    assert.ok(!err);
    assert.ok(typeof response.body.result === 'number');
    return done();
  });
};


exports.test = function(done){
  after(function(){
    console.log('after befortest');
  });
  
  supertest(app)
  .get('/add?a=1&b=1')
  .expect(200)
  .end(done);
};

exports.before =function(){
  console.log('before');
};

exports.after = function(){
  console.log('after');
};
  

exports.beforeEach =function(){
  console.log('beforeEach');
};

exports.afterEach = function(){
  console.log('afterEach');
}
*/