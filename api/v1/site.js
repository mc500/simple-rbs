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
 * Site API Modules
 */
var smrdb = require('./smrdb');
var cloudant = smrdb.cloudant;
var dbCredentials = smrdb.dbCredentials;
var mydb = cloudant.db.use(dbCredentials.dbName);

var common = require('./common');

//
function createNewSite(request, response) {
    console.log('createNewSite');

    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var siteid = body.siteid;
    var location = body.location;

    if (!siteid) {
        common.responseError(response, 'failed to create a site', 'siteid is required', 404);
        return;
    }

    var site = {
        '_id': siteid,
        'type': 'site',
        'siteid': siteid,
        'location': location,
        'name': siteid,
        'status': 'active'
    };

    mydb.insert(site).then(function(newdoc) {
        console.log('site created: '+JSON.stringify(newdoc));
        common.responseOK(response);
    }).catch(function(err) {
        console.log('failed to create a site');
        common.responseError(response, err);
    });
}

function getSiteInfo(request, response) {
    console.log('getSiteInfo');

    var siteid = request.query.siteid;

    if (!siteid) {
        common.responseError(response, 'failed to get a site', 'siteid is required', 404);
        return;
    }

    mydb.get(siteid).then(function(body) {
        common.responseOK(response, {
            'siteid': body.siteid,
            'location': body.location,
            'status': body.status
        });
    }).catch(function(err) {
        console.log('failed to get a site: '+ JSON.stringify(err));
        common.responseError(response, err);
    });
}

function updateSiteInfo(request, response) {
    console.log('updateSiteInfo');

    var body = request.body;

    var siteid = body.siteid;
    if (!siteid) {
        common.responseError(response, 'failed to update a site', 'siteid is required', 404);
        return;
    }

    mydb.get(siteid).then(function(sitedoc) {
        mydb.insert(Object.assign(sitedoc, {
            'name': body.name,
            'location': body.location,
            'status': body.status
        })).then(function() {
            console.log('site updated');
            common.responseOK(response);
        }).catch(function(err) {
            console.log('failed to update site');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get a site: '+ JSON.stringify(err));
        common.responseError(response, err);
    });
}

function inactiveSite(request, response) {
    console.log('inactiveSite');

    var body = request.body;

    var siteid = body.siteid;
    if (!siteid) {
        common.responseError(response, 'failed to inactive a site', 'siteid is required', 404);
        return;
    }

    mydb.get(siteid).then(function(sitedoc) {
        mydb.insert(Object.assign(sitedoc, {
            'status': 'inactive'
        })).then(function() {
            console.log('site inactivated');

            // TODO: Inactive sub meeting rooms
            common.responseOK(response);
        }).catch(function(err) {
            console.log('failed to inactive site');
            common.responseError(response, err);
        });
    }).catch(function(err) {
        console.log('failed to get a site: '+ JSON.stringify(err));
        common.responseError(response, err);
    });
}

function listSites(request, response) {
    console.log('listSites');
    response.setHeader('Content-Type', 'application/json');

    var userid = request.query.userid;

    mydb.view('resouces', 'sites', {}).then(function(body) {

        var len = body.rows.length;
        console.log('total # of docs -> ' + len);
        if (len == 0) {
            response.write('[]'); // empty array
            response.end();
            return;
        }

        var docList = [];
        body.rows.forEach(function (doc) {
            console.log(doc.value);

            // TODO: Filter sites for the user
            docList.push(doc.value);
        });
        response.write(JSON.stringify(docList));
        response.end();
    }).catch(function(err) {
        console.log('failed to get sites');
        common.responseError(response, err);
    });
}

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

function listRoomsByFloor(request, response) {
    console.log('listRoomsByFloor');
    response.setHeader('Content-Type', 'application/json');

    var siteid = request.query.siteid;
    var floor = request.query.floor;

    mydb.view('resouces', 'rooms_by_floor', {key:[siteid, Number(floor)]}).then(function(body) {

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

module.exports = {
    'initialize': function(app, options) {
        app.delete('/api/smr/v1/site', inactiveSite);
        app.get('/api/smr/v1/site', getSiteInfo);
        app.post('/api/smr/v1/site', createNewSite);
        app.put('/api/smr/v1/site', updateSiteInfo);
        app.get('/api/smr/v1/site/list', listSites);
        app.get('/api/smr/v1/site/rooms', listRooms);
        app.get('/api/smr/v1/site/rooms/byfloor', listRoomsByFloor);
    }
};