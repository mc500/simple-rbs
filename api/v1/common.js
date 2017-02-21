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

//
var defaultDateRange = {
    'minimum' : 10*60*1000, // 10 minutes
    'maximum' : 208*24*60*60*1000 // 208 days
};

/*
 * Common Handling Module
 */
function validateDateRange(start, end, minimum, maximum) {

    // empty, null, 0, undefined are not used as date time value
    if (!(start && end)) {
        return false;
    }

    minimum = minimum || defaultDateRange.minimum;

    if ((end - start) <  minimum ) {
        return false; // invalid
    }

    maximum = maximum || defaultDateRange.maximum;

    if ((end - start) >  maximum ) {
        return false; // invalid
    }

    return true;
}

function convDateInMillisec(datetime) {

    try {
        var ndate = Number(datetime);
        if (isNaN(ndate)) {
            return new Date(datetime).getTime();
        }
        return ndate;
    } catch(error) {
        console.error('failed to convert in milliseconds: '+datetime);
    }
}

function responseOK(response, obj) {
    if (obj) {
//        console.log(JSON.stringify(obj));
        response.json(obj);
    } else {
        response.sendStatus(200);
    }
}

function responseError(response, error, reason, statusCode) {

    console.error('responseError is calling');

    if (arguments.length == 3) {
        if (typeof reason == 'number') {
            statusCode = reason;
            reason = undefined;
        } else {
            statusCode = 500;
        }
    } else if (arguments.length == 2 && typeof error == 'string') {
        statusCode = 500;
    }

    var err = error.hasOwnProperty('error') ? error :
        error.hasOwnProperty('stack') ? errObject(error.message, error.stack, 500) :  errObject(error, reason, statusCode);

    console.log(JSON.stringify(err));
    response.status(err.statusCode).send(err);
}

function responseNotImplemented(request, response) {
    // extract API name from request
    var error = 'API failed';
    common.responseError(response, error, 'Not implemented yet', 501);
}

function errObject(error, reason, statusCode) {
    return {
        'error': error,
        'reason': reason,
        'statusCode': statusCode
    }
}

module.exports = {
    'validateDateRange': validateDateRange,
    'convDateInMillisec': convDateInMillisec,
    'responseOK': responseOK,
    'responseError': responseError,
    'responseNotImplemented': responseNotImplemented,
    'errObject': errObject
};