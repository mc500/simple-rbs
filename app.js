/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), fs = require('fs');

var app = express();

var cloudant;

var dbCredentials = {
    dbName : 'smr'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function initDBConnection() {

    var db;

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
                                    "map": "function (doc) {\n  if (doc.type == 'room') {\n    emit(doc.name, {\n      \"name\": doc.name,\n      \"capacity\": doc.capacity,\n      \"phone\": doc.phone,\n      \"location\": doc.location,\n      \"facilities\": doc.facilities,\n      \"timezone\": doc.timezone,\n    });\n  }\n}"
                                },
                                "site": {
                                    "map": "function (doc) {\n  if (doc.type == 'site') {\n    emit(doc._id, doc.location);\n  }\n}"
                                },
                                "freebusy": {
                                    "map": "function (doc) {\n  if (doc.type == 'room') {\n    emit(doc._id, {\n      'room': doc.name,\n      'freebusy':doc.freebusy\n    });\n  }\n}"
                                },
                                "events": {
                                    "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit([(new Date(doc.start)).getTime(), doc.room], doc.subscriber.name);\n  }\n}"
                                },
                                "freebusy-validator": {
                                    "map": "function(newDoc, oldDoc, userCtx, secObj) {\n  if (newDoc.type === 'room') {\n    var freebusy = newDoc.freebusy;\n\n    if (freebusy === undefined) {\n      throw({forbidden: 'Document must have an freebusy.'});\n    }\n\n    if (!Array.isArray(freebusy)) {\n      throw({forbidden: 'freebusy must be instance of Array.'});\n    }\n\n    // sort\n    var sorted = freebusy.sort(function(a,b) { return a.start-b.start;});\n\n    // check conflition\n    var prev;\n    var conflicted = sorted.some(function(obj, idx, arr) {\n        if (prev !== undefined && obj.start < (prev.start + prev.duration)) {\n          conflictedIdx = idx;\n          return true;\n        }\n        prev = obj;\n        return false;\n    });\n\n    if (conflicted) {\n      throw({forbidden: 'freebusy should not be conflicted.'});\n    }\n  }\n}"
                                },
                                "events_by_room": {
                                    "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit([doc.room, (new Date(doc.start)).getTime()], {\n      \"start\": doc.start,\n      \"end\": doc.end,\n      \"startText\": doc.startText,\n      \"endText\": doc.endText,\n      \"room\": doc.room,\n      \"subscriber\": doc.subscriber\n    });\n  }\n}"
                                },
                                "events_by_email": {
                                    "map": "function (doc) {\n  if (doc.type == 'event') {\n    emit(doc.subscriber.email, {\n      \"start\": doc.start,\n      \"end\": doc.end,\n      \"startText\": doc.startText,\n      \"endText\": doc.endText,\n      \"room\": doc.room,\n      \"subscriber\": doc.subscriber\n    });\n  }\n}"
                                }
                            },
                            "language": "javascript"
                        }, {
                            "_id": "_design/validator_freebusy",
                            "validate_doc_update": "function(newDoc, oldDoc, userCtx, secObj) {\n  if (newDoc.type === 'room') {\n    var freebusy = newDoc.freebusy;\n\n    if (freebusy === undefined) {\n      throw({forbidden: 'Document must have an freebusy.'});\n    }\n\n    if (!Array.isArray(freebusy)) {\n      throw({forbidden: 'freebusy must be instance of Array.'});\n    }\n\n    // sort\n    var sorted = freebusy.sort(function(a,b) { return a.start-b.start;});\n\n    // check conflition\n    var prev;\n    var conflicted = sorted.some(function(obj, idx, arr) {\n        if (prev !== undefined && obj.start < (prev.start + prev.duration)) {\n          conflictedIdx = idx;\n          return true;\n        }\n        prev = obj;\n        return false;\n    });\n\n    if (conflicted) {\n      throw({forbidden: 'freebusy should not be conflicted.'});\n    }\n  }\n}"
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
}

initDBConnection();

app.get('/', routes.index);

/**
 * Get all meeting rooms
 */
app.get('/api/smr/v1/rooms', function(request, response) {
    var mydb = cloudant.db.use(dbCredentials.dbName);
    mydb.view('resouces', 'rooms', function(err, body) {
        if (!err) {
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
                console.log(doc.value);
                docList.push(doc.value);
            });
            response.write(JSON.stringify(docList));
            response.end();
        } else {
            console.log(err);
            response.status(500).send({ error: err })
        }
    });
});

/**
 * Get free-busy data for rooms
 */
app.get('/api/smr/v1/freebusy', function(request, response) {

    // Test room : 12M01/Monitor/6/3IFC
    //console.log('room: '+request.query.room);

    response.setHeader('Content-Type', 'application/json');

    var mydb = cloudant.use(dbCredentials.dbName);

    var params = {};

    if (request.query.room) {
        params['key'] = request.query.room;
    }

    // filter
    var filter = {};
    if (request.query.begin) {
        filter['begin'] = Number(request.query.begin);
        if (filter.begin === NaN) {
            filter['begin'] = new Date(request.query.begin).getTime();
        }
    }
    if (request.query.end) {
        filter['end'] = Number(request.query.end);
        if (filter.end === NaN) {
            filter['end'] = new Date(request.query.end).getTime();
        }
    }

    mydb.view('resouces', 'freebusy', params, function(err, body) {
        if (!err) {
            var len = body.rows.length;
            console.log('total # of docs -> '+len);
            if(len == 0) {
                response.write('[]'); // empty array
                response.end();
                return;
            }

            var docList = [];
            body.rows.forEach(function(doc) {
                //console.log(doc.value);

                // Array
                var filtered = doc.value.freebusy.filter(function(slot) {
                    if (filter.begin && (slot.start < filter.begin)) {
                        //console.log('begin filter');
                        return false;
                    }

                    if (filter.end && (slot.start > filter.end)) {
                        //console.log('end filter');
                        return false;
                    }
                    //console.log('show: '+filter.begin+', '+slot.start);
                    return true;
                });

                console.log('# of '+doc.value.room+' freebusy: '+filtered.length);

                docList.push({
                    'room': doc.value.room,
                    'freebusy': filtered
                });
            });
            response.write(JSON.stringify(docList));
            response.end();
        } else {
            console.log('failed to get view');
            response.status(err.statusCode).send(err);
        }
    });
});

/**
 * Book on the room
 * Content-Type should be 'application/json'
 {
    'start': 'start date time in milliseconds',
    'end': 'end date time in milliseconds',
    'room': 'room name',
    'subscriber': {
        '':
        'name': 'user name',
        'email': 'user email',
        'phone': 'user phone number'
    }
 }
 */
app.post('/api/smr/v1/book', function(request, response) {
    var slotsize = 10; // in minutes
    var minslot = slotsize*10000; // in millsec

    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var room = body.room;
    var start = body.start;
    var end = body.end;
    var subscriber = body.subscriber || {'name': 'In USE'};

    var duration = end - start;

    //
    if (duration <  minslot ) {
        //
        response.status(500).send({ error: 'invalid date time!!!' });
        return;
    }

    var event = {
        'type': 'event',
        'startText': new Date(start).toISOString(), // "2016-12-01T00:00:00+09:00"
        'endText': new Date(end).toISOString(), // "2016-12-01T01:00:00+09:00"
        'start': start,
        'end': end,
        'room': room,
        'subscriber': subscriber
    };

    // step1. get data for the room
    var mydb = cloudant.db.use(dbCredentials.dbName);

    mydb.get(room).then(function(doc) {

        // step2. freebusy array
        doc.freebusy.push({
            "start": start,
            "duration": duration
        });

        // step3. update freebusy to server
        mydb.insert(doc).then(function(newdoc) {
            console.log('freebusy updated');

            // step5. add the new event
            mydb.insert(event).then(function(doc) {
                console.log('event inserted');
                response.sendStatus(200);
            }).catch(function(err) {
                console.log('failed to insert the event:' + event);
                response.status(err.statusCode).send(err);
            });
        }).catch(function(err) {
            console.log('failed to update freebusy:' + {'start': start, 'duration': duration});
            response.status(err.statusCode).send(err);
        });


    }).catch(function(err){
        console.log('failed to get document');
        response.status(err.statusCode).send(err);
    });
});



/**
 * Delete the booked event on the room
 * Content-Type should be 'application/json'
 */
app.delete('/api/smr/v1/book', function(request, response) {

    response.setHeader('Content-Type', 'application/json');

    if (!request.query.room && request.query.start) {
        var err = errObject('failed to get document', 'insufficient parameter', 500);
        console.log(err.error);
        response.status(err.statusCode).send(err);
        return;
    }

    var start = Number(request.query.start);
    if (start == NaN) {
        var err = errObject('failed to get document', 'start key is not a number', 500);
        console.log(err.error);
        response.status(err.statusCode).send(err);
        return;
    }

    var room = request.query.room;

    var mydb = cloudant.db.use(dbCredentials.dbName);

    // step1. get data for the room
    mydb.get(room).then(function(doc) {

        // step2. freebusy array
        var idx = -1;
        if (!doc.freebusy.some(function(obj, i, arr){
            if (obj.start == start) {
                idx = i;
                return true;
            }
        })) {
            var err = errObject('failed to get freebusy', 'start key is not in freebusy', 500);
            console.log(err.error);
            response.status(err.statusCode).send(err);
            return;
        }

        doc.freebusy.splice(idx, 1);

        // step3. update freebusy to server
        mydb.insert(doc).then(function(newdoc) {
            console.log('freebusy deleted');

            // step4. find the event

            mydb.view('resouces', 'events_by_room', {
                'key': [room, start],
                'include_docs': true
            }).then(function(body){

                var len = body.rows.length;
                console.log('total # of docs -> '+len);
                if(len == 0) {
                    // Document not found
                    var err = errObject('failed to get document', 'Unknown key', 404);
                    console.log(err.error);
                    response.status(err.statusCode).send(err);
                    return;
                }

                if (len != 1) {
                    console.error('there are ' + len +' event documents!!! please check it later.');
                }

                console.log(body.rows[0].doc);

                var doc = body.rows[0].doc;

                // step5. destroy the event
                mydb.destroy(
                    doc._id, doc._rev
                ).then(function(body){
                    console.log('event destoryed');
                    response.sendStatus(200);
                }).catch(function(err) {
                    console.log('failed to destroy the event:' + event);
                    response.status(err.statusCode).send(err);
                });
            }).catch(function(err) {
                console.log('failed to search the event:' + event);
                response.status(err.statusCode).send(err);
            });
        }).catch(function(err) {
            console.log('failed to update freebusy with start:' + start);
            response.status(err.statusCode).send(err);
        });


    }).catch(function(err){
        console.log('failed to get document');
        response.status(err.statusCode).send(err);
    });
});




/**
 * Create a site
 * Content-Type should be 'application/json'
 {
    'name': name,
    'location': location
 }
 */
app.post('/api/smr/v1/site', function(request, response) {

    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var name = body.name;
    var location = body.location;

    if (!name) {
        var err = errObject('failed to create a site', 'name is invalid', 500);
        console.log(err.error);
        response.status(err.statusCode).send(err);
        return;
    }

    var mydb = cloudant.db.use(dbCredentials.dbName);

    var site = {
        '_id': name,
        'type': 'site',
        'name': name,
        'location': location
    };

    mydb.insert(site).then(function(newdoc) {
        console.log('site created: '+JSON.stringify(newdoc));
        response.sendStatus(200);
    }).catch(function(err) {
        console.log('failed to create site: ');
        response.status(err.statusCode).send(err);
    });
});


/**
 * Create Room
 * Content-Type should be 'application/json'
 {
    'name': name,
    'capacity': capacity,
    'phone': phone,
    'location': location,
    'facilities': facilities,
    'timezone': timezone,
 }
 */
app.post('/api/smr/v1/room', function(request, response) {

    response.setHeader('Content-Type', 'application/json');

    var body = request.body;

    var name = body.name;
    var capacity = body.capacity;
    var phone = body.phone;
    var location = body.location;
    var facilities = body.facilities;
    var timezone = body.timezone;

    if (!name) {
        var err = errObject('failed to create a room', 'name is invalid', 500);
        console.log(err.error);
        response.status(err.statusCode).send(err);
        return;
    }

    if (!capacity) {
        var err = errObject('failed to create a room', 'capacity is invalid', 500);
        console.log(err.error);
        response.status(err.statusCode).send(err);
        return;
    }


    var mydb = cloudant.db.use(dbCredentials.dbName);

    var room = {
        '_id': name,
        'type': 'room',
        'name': name,
        'capacity': capacity,
        'phone': phone,
        'location': location,
        'facilities': facilities,
        'timezone': timezone,
        'freebusy': []
    };

    mydb.insert(room).then(function(newdoc) {
        console.log('room created: ' + JSON.stringify(newdoc));
        response.sendStatus(200);
    }).catch(function(err) {
        console.log('failed to create room: ');
        response.status(err.statusCode).send(err);
    });
});

function errObject(error, reason, statusCode) {
    return {
        'error': error,
        'reason': reason,
        'statusCode': statusCode
    }
}

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
