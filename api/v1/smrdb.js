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
 * Cloudant DB Module
 */

var cloudant, db;

var dbCredentials = {
    dbName : 'smr'
};

if(process.env.VCAP_SERVICES) {
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for(var vcapService in vcapServices){
        if(vcapService.match(/cloudant/i)){
            dbCredentials.host = vcapServices[vcapService][0].credentials.host;
            dbCredentials.port = vcapServices[vcapService][0].credentials.port;
            dbCredentials.user = vcapServices[vcapService][0].credentials.username;
            dbCredentials.password = vcapServices[vcapService][0].credentials.password;
            dbCredentials.url = vcapServices[vcapService][0].credentials.url;

            cloudant = require('cloudant')({
                'url': dbCredentials.url,
                'plugin': 'promises'
            });

            // check if DB exists if not create
            cloudant.db.create(dbCredentials.dbName, function (err, res) {
                if (err) { console.log('could not create db ', err); }
                else {
                    // Create Design

                    var design = [{
                        "_id": "_design/resouces",
                        "views": {
                            "rooms": {
                                "map": "function (doc) {\n  if (doc.type == 'room') {\n    emit(doc.siteid, {\n      'roomid': doc.roomid,\n      'name': doc.name,\n      'siteid': doc.siteid,\n      'capacity': doc.capacity,\n      'phone': doc.phone,\n      'floor': doc.floor,\n      'facilities': doc.facilities,\n      'timezone': doc.timezone\n    });\n  }\n}"
                            },
                            "freebusy": {
                                "map": "function (doc) {\n  if (doc.type == 'room') {\n    emit(doc._id, {\n      'roomid': doc.roomid,\n      'name': doc.name,\n      'freebusy':doc.freebusy\n    });\n  }\n}"
                            },
                            "freebusy-validator": {
                                "map": "function(newDoc, oldDoc, userCtx, secObj) {\n  if (newDoc.type === 'room') {\n    var freebusy = newDoc.freebusy;\n\n    if (freebusy === undefined) {\n      throw({forbidden: 'Document must have an freebusy.'});\n    }\n\n    if (!Array.isArray(freebusy)) {\n      throw({forbidden: 'freebusy must be instance of Array.'});\n    }\n\n    // sort\n    var sorted = freebusy.sort(function(a,b) { return a.start-b.start;});\n\n    // check conflition\n    var prev;\n    var conflicted = sorted.some(function(obj, idx, arr) {\n        if (prev !== undefined && obj.start < prev.end) {\n          conflictedIdx = idx;\n          return true;\n        }\n        prev = obj;\n        return false;\n    });\n\n    if (conflicted) {\n      throw({forbidden: 'freebusy should not be conflicted.'});\n    }\n  }\n}"
                            },
                            "events_by_room": {
                                "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit([doc.roomid, (new Date(doc.start)).getTime()], {\n      \"id\": doc._id,\n      \"start\": doc.start,\n      \"end\": doc.end,\n      \"startText\": doc.startText,\n      \"endText\": doc.endText,\n      \"roomid\": doc.roomid,\n      \"siteid\": doc.siteid,\n      \"user\": doc.user\n    });\n  }\n}"
                            },
                            "events_by_site": {
                                "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit([doc.siteid, (new Date(doc.start)).getTime()], {\n      \"id\": doc._id,\n      \"start\": doc.start,\n      \"end\": doc.end,\n      \"startText\": doc.startText,\n      \"endText\": doc.endText,\n      \"roomid\": doc.roomid,\n      \"siteid\": doc.siteid,\n      \"user\": doc.user\n    });\n  }\n}"
                            },
                            "events_by_user": {
                                "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit([doc.siteid, doc.user.userid, (new Date(doc.start)).getTime()], {\n      \"id\": doc._id,\n      \"start\": doc.start,\n      \"end\": doc.end,\n      \"startText\": doc.startText,\n      \"endText\": doc.endText,\n      \"roomid\": doc.roomid,\n      \"siteid\": doc.siteid,\n      \"user\": doc.user\n    });\n  }\n}"
                            },
                            "rooms_by_floor": {
                                "map": "function (doc) {\n  if (doc.type == 'room') {\n    emit([doc.siteid, doc.floor], {\n      'roomid': doc.roomid,\n      'name': doc.name,\n      'siteid': doc.siteid,\n      'capacity': doc.capacity,\n      'phone': doc.phone,\n      'floor': doc.floor,\n      'facilities': doc.facilities,\n      'timezone': doc.timezone\n    });\n  }\n}"
                            },
                            "sites": {
                                "map": "function (doc) {\n  if (doc.type == 'site') {\n    emit(doc._id, {\n      \"siteid\": doc.siteid,\n      \"name\": doc.name,\n      \"location\": doc.location\n    });\n  }\n}"
                            }
                        },
                        "language": "javascript"
                    }, {
                        "_id": "_design/validator_freebusy",
                        "validate_doc_update": "function(newDoc, oldDoc, userCtx, secObj) {\n  if (newDoc.type === 'room') {\n    var freebusy = newDoc.freebusy;\n\n    if (freebusy === undefined) {\n      throw({forbidden: 'Document must have an freebusy.'});\n    }\n\n    if (!Array.isArray(freebusy)) {\n      throw({forbidden: 'freebusy must be instance of Array.'});\n    }\n\n    // sort\n    var sorted = freebusy.sort(function(a,b) { return a.start-b.start;});\n\n    // check conflition\n    var prev;\n    var conflicted = sorted.some(function(obj, idx, arr) {\n        if (prev !== undefined && obj.start < prev.end) {\n          conflictedIdx = idx;\n          return true;\n        }\n        prev = obj;\n        return false;\n    });\n\n    if (conflicted) {\n      throw({forbidden: 'freebusy should not be conflicted.'});\n    }\n  }\n}"
                    }];

                    //

                    var mydb = cloudant.db.use(dbCredentials.dbName);

                    design.forEach(function(view){
                        mydb.insert(view).then(function(newdoc) {
                            console.log('view created: '+view);
                        }).catch(function(err) {
                            console.log('failed to create view: ');
                        });
                    });

                }
            });

            db = cloudant.use(dbCredentials.dbName);
            break;
        }
    }
    if(db==null){
        console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
    }
} else{
    console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
    // For running this app locally you can get your Cloudant credentials
    // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
    // Variables section for an app in the Bluemix console dashboard).
    // Alternately you could point to a local database here instead of a
    // Bluemix service.
    //dbCredentials.host = "REPLACE ME";
    //dbCredentials.port = REPLACE ME;
    //dbCredentials.user = "REPLACE ME";
    //dbCredentials.password = "REPLACE ME";
    //dbCredentials.url = "REPLACE ME";

    //cloudant = require('cloudant')(dbCredentials.url);

    // check if DB exists if not create
    //cloudant.db.create(dbCredentials.dbName, function (err, res) {
    //    if (err) { console.log('could not create db ', err); }
    //});

    //db = cloudant.use(dbCredentials.dbName);
}

module.exports = {
    'cloudant': cloudant,
    'dbCredentials': dbCredentials
};