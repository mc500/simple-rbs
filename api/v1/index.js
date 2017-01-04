'use strict'

console.log('APIs initialize');

var site = require('./site');
var room = require('./room');
var freebusy = require('./freebusy');
var book = require('./book');
var common = require('./common');

module.exports = {
    'initialize': function(app, options) {

        // Auth
        app.get('/auth/checklogin', function(request, response) {
            common.responseError(response, 'checklogin failed', 'Not implemented yet', 501);
        });
        app.get('/auth/logout', function(request, response) {
            common.responseError(response, 'logout failed', 'Not implemented yet', 501);
        });

        site.initialize(app, options);
        room.initialize(app, options);
        freebusy.initialize(app, options);
        book.initialize(app, options);
    }
};