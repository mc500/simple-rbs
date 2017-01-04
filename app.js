/**
 * Module dependencies.
 */

var express = require('express'), 
    http = require('http'), 
    path = require('path'), 
    fs = require('fs');

// Local View
var routes = require('./routes'),
    APIs = require('./api/v1');

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

var spec = fs.readFileSync('./api/v1/swagger.yaml', 'utf8');
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
