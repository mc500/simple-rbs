/*
 * Routes
 */
module.exports = {
    'initialize': function(app, options) {
      
        // Main Route
        app.get('/', function(req, res){
          res.render('index.html', {});
        });

        // Page Routes with module as controller
        app.get('/pages/*', function(req, res){
          var modulename = req._parsedUrl.pathname.substr(7),
              pathname = modulename+'.html';
          //console.log(req);
          try {

              var fn_module = require('./'+modulename);
              console.log('found');
              res.render(pathname, fn_module(req, res));
          } catch(exception) {
            console.log('not found:'+exception);
              res.render(pathname, req.query);
          }
        });
    }
}