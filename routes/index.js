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