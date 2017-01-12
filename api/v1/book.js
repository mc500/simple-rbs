/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/*
 * Freebusy API Modules
 */
var smrdb = require('./smrdb');
var cloudant = smrdb.cloudant;
var dbCredentials = smrdb.dbCredentials;

// step1. Find event detail
var mydb = cloudant.db.use(dbCredentials.dbName);

var common = require('./common');

//
var slotsize = 10; // in minutes
var minslot = slotsize*10000; // in millsec

function bookOnTheRoom(request, response) {
    console.log('bookOnTheRoom');
    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var roomid = body.roomid;
    var start = common.convDateInMillisec(body.start);
    var end = common.convDateInMillisec(body.end);
    var user = body.user || {'name': 'In USE'};
    var purpose = body.purpose;

    if (!common.validateDateRange(start, end, minslot)) {
        //
        common.responseError(response, 'invalid date time!!!', 400);
        return;
    }

    if (!roomid) {
        common.responseError(response, 'roomid is undefined', 400);
        return;
    }

    var duration = end - start;
    var event = {
        'type': 'event',
        'startText': new Date(start).toISOString(), // "2016-12-01T00:00:00+09:00"
        'endText': new Date(end).toISOString(), // "2016-12-01T01:00:00+09:00"
        'start': start,
        'end': end,
        'roomid': roomid,
        'siteid': undefined, // siteid will be overridded from room information
        'purpose': purpose,
        'user': user
    };

    // step1. get data for the room
    mydb.get(roomid).then(function(roomdoc) {

        event['siteid'] = roomdoc.siteid;

        // step2. freebusy array
        roomdoc.freebusy.push({
            "start": start,
            "end": end,
            "duration": duration
        });
        
        // step3. update freebusy to server
        mydb.insert(roomdoc).then(function() {
            console.log('freebusy updated');

            // step5. add the new event
            mydb.insert(event).then(function(evtdoc) {
                console.log('event inserted: ' + JSON.stringify(evtdoc));
                console.log('arguments: '+arguments.length);
                //common.responseOK(response);
                //common.responseOK(response, Object.assign({'eventid': evtdoc.id}, event));
                common.responseOK(response, {'eventid': evtdoc.id});
            }).catch(function(err) {
                console.log('failed to insert the event:' + event);
                common.responseError(response, err);
            });
        }).catch(function(err) {
            console.log('failed to update freebusy:' + {'start': start, 'end': end, 'duration': duration});
            if (err.hasOwnProperty('statusCode') && err.statusCode == 403) {
                common.responseError(response, {
                    "error": "conflict",
                    "reason": err.reason,
                    "statusCode": 409
                });
                return;
            }
            common.responseError(response, err);
        });


    }).catch(function(err){
        console.log('failed to get document');
        common.responseError(response, err);
    });
}

function getBookedEvent(request, response) {
    console.log('getBookedEvent');

    response.setHeader('Content-Type', 'application/json');

    var eventid = request.query.eventid;

    if (!eventid) {
        common.responseError(response, 'eventid is undefined', 400);
        return;
    }

    // get data for the event
    mydb.get(eventid).then(function(doc) {
        //var ret = Object.assign({}, doc);
        common.responseOK(response, {
            'eventid': doc._id,
            'roomid': doc.room,
            'start': doc.start,
            'end': doc.end,
            'startText': doc.startText,
            'endText': doc.endText,
            'purpose': doc.purpose,
            'user': doc.user
        });
    }).catch(function(err){
        console.log('failed to get document');
        common.responseError(response, err);
    });
}

function deleteBookedEvent(request, response) {
    console.log('deleteBookedEvent');

    response.setHeader('Content-Type', 'application/json');

    var roomid = request.query.roomid;
    var eventid = request.query.eventid;

    if (!roomid) {
        common.responseError(response, 'roomid is undefined', 400);
        return;
    }

    if (!eventid) {
        common.responseError(response, 'eventid is undefined', 400);
        return;
    }

    // step1. Find event detail
    mydb.get(eventid).then(function(evtdoc) {
        var start = evtdoc.start;

        // step2. get data in the room
        mydb.get(roomid).then(function(roomdoc) {

            // step3. check if it is in freebusy array
            var idx = -1;
            if (!roomdoc.freebusy.some(function(obj, i, arr){
                    if (obj.start == start) {
                        idx = i;
                        return true;
                    }
                })) {
                common.responseError(response, 'failed to get freebusy', 'start key is not in freebusy', 404);
                return;
            }

            // Pop
            roomdoc.freebusy.splice(idx, 1);

            // step4. update freebusy to server
            mydb.insert(roomdoc).then(function() {
                console.log('freebusy deleted');

                // step4. destroy the event
                mydb.destroy(evtdoc._id, evtdoc._rev).then(function(){
                    console.log('event destoryed');
                    common.responseOK(response);
                }).catch(function(err) {
                    console.log('failed to destroy the event:' + event);
                    common.responseError(response, err);
                });
            }).catch(function(err) {
                console.log('failed to update freebusy with start:' + start);
                common.responseError(response, err);
            });


        }).catch(function(err){
            console.log('failed to get document');
            common.responseError(response, err);
        });
    }).catch(function(err){
        console.log('failed to get document');
        common.responseError(response, err);
    });
}

//
function searchBySite(request, response) {
    console.log('searchBySite');

    response.setHeader('Content-Type', 'application/json');

    var siteid = request.query.siteid;
    var start = common.convDateInMillisec(request.query.start);
    var end = common.convDateInMillisec(request.query.end);

    if (!common.validateDateRange(start, end, minslot)) {
        //
        common.responseError(response, 'invalid date time!!!', 400);
        return;
    }

    if (!siteid) {
        common.responseError(response, 'siteid is undefined', 400);
        return;
    }

    end -= 1000; // end time will be 1 secs earlier

    mydb.get(siteid).then(function() {
        mydb.view('resouces', 'events_by_site', { startkey: [siteid, start], endkey: [siteid, end]}).then(function(body) {
            response.setHeader('Content-Type', 'application/json');
            var len = body.rows.length;
            console.log('total # of docs -> '+len);
            if(len == 0) {
                response.write('[]'); // empty array
                response.end();
                return;
            }

            var docList = [];
            body.rows.forEach(function(doc) {
//                console.log(doc.value);
                docList.push(doc.value);
            });
            response.write(JSON.stringify(docList));
            response.end();
        }).catch(function(err){
            console.log('failed to get document');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get a site: '+ JSON.stringify(err));
        common.responseError(response, err);
    });
}

function searchByUser(request, response) {
    console.log('searchByUser');

    response.setHeader('Content-Type', 'application/json');

    var siteid = request.query.siteid;
    var userid = request.query.userid;
    var start = common.convDateInMillisec(request.query.start);
    var end = common.convDateInMillisec(request.query.end);

    if (!common.validateDateRange(start, end, minslot)) {
        //
        common.responseError(response, 'invalid date time!!!', 400);
        return;
    }

    if (!siteid) {
        common.responseError(response, 'siteid is undefined', 400);
        return;
    }

    if (!userid) {
        common.responseError(response, 'userid is undefined', 400);
        return;
    }

    end -= 1000; // end time will be 1 secs earlier

    mydb.get(siteid).then(function() {
        mydb.view('resouces', 'events_by_user', { startkey: [siteid, userid, start], endkey: [siteid, userid, end]}).then(function(body) {
            response.setHeader('Content-Type', 'application/json');
            var len = body.rows.length;
            console.log('total # of docs -> '+len);
            if(len == 0) {
                response.write('[]'); // empty array
                response.end();
                return;
            }

            var docList = [];
            body.rows.forEach(function(doc) {
//                console.log(doc.value);
                docList.push(doc.value);
            });
            response.write(JSON.stringify(docList));
            response.end();
        }).catch(function(err){
            console.log('failed to get document');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get a site: '+ JSON.stringify(err));
        common.responseError(response, err);
    });
}

function searchByRoom(request, response) {
    console.log('searchByRoom');

    response.setHeader('Content-Type', 'application/json');

    var roomid = request.query.roomid;
    var start = common.convDateInMillisec(request.query.start);
    var end = common.convDateInMillisec(request.query.end);

    if (!common.validateDateRange(start, end, minslot)) {
        //
        common.responseError(response, 'invalid date time!!!', 400);
        return;
    }

    if (!roomid) {
        common.responseError(response, 'roomid is undefined', 400);
        return;
    }

    end -= 1000; // end time will be 1 secs earlier

    mydb.view('resouces', 'events_by_room', { startkey: [roomid, start], endkey: [roomid, end]}).then(function(body) {
        response.setHeader('Content-Type', 'application/json');
        var len = body.rows.length;
        console.log('total # of docs -> '+len);
        if(len == 0) {
            response.write('[]'); // empty array
            response.end();
            return;
        }

        var docList = [];
        body.rows.forEach(function(doc) {
//            console.log(doc.value);
            docList.push(doc.value);
        });
        response.write(JSON.stringify(docList));
        response.end();
    }).catch(function(err){
        console.log('failed to get document');
        common.responseError(response, err);
    });
}


module.exports = {
    'initialize': function(app, options) {
        app.delete('/api/smr/v1/book', deleteBookedEvent);
        app.get('/api/smr/v1/book', getBookedEvent);
        app.post('/api/smr/v1/book', bookOnTheRoom);
        app.get('/api/smr/v1/book/search/bysite', searchBySite);
        app.get('/api/smr/v1/book/search/byuser', searchByUser);
        app.get('/api/smr/v1/book/search/byroom', searchByRoom);
    }
};