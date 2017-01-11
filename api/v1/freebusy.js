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
var mydb = cloudant.use(dbCredentials.dbName);

var common = require('./common');

//
var slotsize = 10; // in minutes
var minslot = slotsize*60000; // in millsec

function listRooms(request, response) {
    console.log('listRooms');
    response.setHeader('Content-Type', 'application/json');

    var siteid = request.query.siteid;

    mydb.view('resouces', 'rooms', {key: siteid}).then(function(body) {

        var len = body.rows.length;
        console.log('total # of docs -> '+len);
        if(len == 0) {
            response.write('[]'); // empty array
            response.end();
            return;
        }

        var docList = [];
        body.rows.forEach(function(doc) {
            console.log(doc.value);
            docList.push(doc.value);
        });
        response.write(JSON.stringify(docList));
        response.end();
    }).catch(function(err) {
        console.log('failed to get rooms');
        common.responseError(response, err);
    });
}

function getConflictQuery(siteid, start, end) {
    var obj = {
        "selector": {
            "type": "event",
            "siteid": siteid,
            "$or": [{ // S <= start < E
                "start": {
                    "$lte": start
                },
                "end": {
                    "$gt": start
                }
            }, {    // S < end <= E
                "start": {
                    "$lt": end
                },
                "end": {
                    "$gte": end
                }
            }, {    // start < S & E < end #### S >= start & E < end
                "start": {
                    "$gte": start
                },
                "end": {
                    "$lt": end
                }
            }]
        },
        "fields": [
            "_id",
            "start",
            "end",
            "type",
            "roomid"
        ],
        "sort": [
            {
                "_id": "asc"
            }
        ]
    };

    return obj;
}

//
function searchAvailableRooms(request, response) {
    console.log('searchAvailableRooms');

    response.setHeader('Content-Type', 'application/json');

    var siteid = request.query.siteid;
    var capacity = Number(request.query.capacity);
    var start = common.convDateInMillisec(request.query.start);
    var end = common.convDateInMillisec(request.query.end);

    if (!siteid) {
        common.responseError(response, 'failed to search a room', 'siteid is required', 404);
        return;
    }

    if (!capacity) {
        common.responseError(response, 'failed to search a room', 'capacity is required', 404);
        return;
    }

    if (!common.validateDateRange(start, end, minslot)) {
        //
        common.responseError(response, 'invalid date time!!!', 400);
        return;
    }

    // List rooms
    mydb.view('resouces', 'rooms', {key: siteid}).then(function(rbody) {

        var len = rbody.rows.length;
        console.log('total # of rooms -> '+len);
        if(len == 0) {
            response.write('[]'); // empty array
            response.end();
            return;
        }

        console.log('start:'+start+', startText:'+new Date(start).toISOString()+', query: '+request.query.start);
        console.log('end:'+end+', endText:'+new Date(end).toISOString()+', query: '+request.query.end);

        // Query conflicting events
        mydb.find(getConflictQuery(siteid, start, end)).then(function(qbody){

            console.log(JSON.stringify(qbody.docs));
            var roomids = qbody.docs.reduce(function(obj, item){
                if (!obj.hasOwnProperty(item.roomid)) {
                    obj[item.roomid] = true;
                    if (item.roomid == '12M12/Monitor/10/3IFC') {

                        console.log('start:'+new Date(item.start).toISOString());
                        console.log('end:'+new Date(item.end).toISOString());
                    }
                }
                return obj;
            }, {});
            // console.log(JSON.stringify(Object.keys(roomids)));

            //
            var docList = [];
            rbody.rows.forEach(function(doc) {
                var room = doc.value;
                console.log(room);
                if (!roomids.hasOwnProperty(room.roomid) && (room.capacity >= capacity)) {
                    docList.push(room);
                }
            });
            response.write(JSON.stringify(docList));
            response.end();
        }).catch(function(err) {
            console.log('failed to get rooms');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get rooms');
        common.responseError(response, err);
    });
}

function getAvailableTime(request, response) {
    console.log('getAvailableTime');

    response.setHeader('Content-Type', 'application/json');

    var roomid = request.query.roomid;
    var start = common.convDateInMillisec(request.query.start);
    var end = common.convDateInMillisec(request.query.end);

    // filter
    var filter = {
        'start': start,
        'end': end
    };

    mydb.get(roomid).then(function(doc) {

        var filtered = doc.freebusy.filter(function (slot) {
            if (filter.start && (slot.start < filter.start)) {
                //console.log('start filter');
                return false;
            }

            if (filter.end && (slot.start > filter.end)) {
                //console.log('end filter');
                return false;
            }
            //console.log('show: '+filter.start+', '+slot.start);
            slot.startText = new Date(slot.start).toISOString();
            slot.endText = new Date(slot.end).toISOString();
            return true;
        });

        console.log('# of ' + doc.roomid + ' freebusy: ' + filtered.length);

        response.json({
            'roomid': doc.roomid,
            'freebusy': filtered
        });
    }).catch(function(err){
        console.log('failed to get view');
        common.responseError(response, err);
    });
}

module.exports = {
    'initialize': function(app, options) {
        app.get('/api/smr/v1/freebusy/available', searchAvailableRooms);
        app.get('/api/smr/v1/freebusy/room', getAvailableTime);
    }
};