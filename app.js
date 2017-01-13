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

var express = require('express'), 
    http = require('http'), 
    path = require('path'), 
    fs = require('fs');

// Local View
//var APIBase = './api/v1_domino';
var APIBase = './api/v1';
var routes = require('./routes'),
    APIs = require(APIBase);

var app = express();

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

app.use(express.static(path.join(__dirname, 'static')));
//app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

var swaggerUi = require('swagger-ui-express');
//var swaggerDocument = require('./api/swagger.yaml');

var spec = fs.readFileSync(APIBase+'/swagger.yaml', 'utf8');
var swaggerDocument = require('js-yaml').safeLoad(spec);
//app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // hide top bar

// Map the express-swagger-ui resources
app.use('/api/v1/docs', express.static(__dirname + '/node_modules/swagger-ui-express/static'));
app.get('/api/v1/docs', function(req, res){
    res.render('swagger-ui-template.html', {
    	'swaggerDoc': JSON.stringify(swaggerDocument),
    	'explorerString': ''
    });
});

// Page Routing
routes.initialize(app);


APIs.initialize(app);
console.log('API service ready');

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// Expose the app instance as module
module.exports = app;