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
 * Room API Modules
 */
var smrdb = require('./smrdb');
var cloudant = smrdb.cloudant;
var dbCredentials = smrdb.dbCredentials;
var mydb = cloudant.db.use(dbCredentials.dbName);

var common = require('./common');

//
function createNewRoom(request, response) {
    console.log('createNewRoom');

    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var roomid = body.roomid;
    var siteid = body.siteid;
    var capacity = body.capacity;
    var phone = body.phone;
    var floor = body.floor;
    var facilities = body.facilities;
    var timezone = body.timezone;

    if (!siteid) {
        common.responseError(response, 'siteid is undefined', 400);
        return;
    }

    if (!roomid) {
        common.responseError(response, 'roomid is undefined', 404);
        return;
    }

    if (!capacity) {
        common.responseError(response, 'capacity is undefined', 400);
        return;
    }

    // step1. check if the site is exist
    mydb.get(siteid).then(function(body) {
        var room = {
            '_id': roomid,
            'type': 'room',
            'roomid': roomid,
            'name': roomid,
            'capacity': capacity,
            'phone': phone,
            'siteid': siteid,
            'floor': floor,
            'facilities': facilities,
            'timezone': timezone,
            'freebusy': []
        };

        mydb.insert(room).then(function(newdoc) {
            console.log('room created: ' + JSON.stringify(newdoc));
            common.responseOK(response);
        }).catch(function(err) {
            console.log('failed to create a room');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get a site');
        common.responseError(response, err);
        return;
    });
}

function getRoomInfo(request, response) {
    console.log('getRoomInfo');

    var roomid = request.query.roomid;

    if (!roomid) {
        common.responseError(response, 'roomid is undefined', 400);
        return;
    }

    mydb.get(roomid).then(function(body) {
        response.json({
            'roomid': body.roomid,
            'name': body.name,
            'siteid': body.siteid,
            'capacity': body.capacity,
            'phone': body.phone,
            'floor': body.floor,
            'facilities': body.facilities,
            'timezone': body.timezone
        });
    }).catch(function(err) {
        console.log('failed to get a room');
        common.responseError(response, err);
    });
}

function updateRoomInfo(request, response) {
    common.responseNotImplemented(request, response);
}

function inactiveRoom(request, response) {
    common.responseNotImplemented(request, response);
}


module.exports = {
    'initialize': function(app, options) {
        app.delete('/api/smr/v1/room', inactiveRoom);
        app.get('/api/smr/v1/room', getRoomInfo);
        app.post('/api/smr/v1/room', createNewRoom);
        app.put('/api/smr/v1/room', updateRoomInfo);
    }
};