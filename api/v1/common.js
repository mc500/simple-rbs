'use strict'

/*
 * Common Handling Module
 */
function validateDateRange(start, end, minimum) {

    // empty, null, 0, undefined are not used as date time value
    if (!(start && end)) {
        return false;
    }

    minimum = minimum || 0;

    if ((end - start) <  minimum ) {
        return false; // invalid
    }

    return true;
}

function convDateInMillisec(datetime) {

    try {
        var ndate = Number(datetime);
        if (ndate === NaN) {
            return new Date(datetime).getTime();
        }
        return ndate;
    } catch(error) {
        console.error('failed to convert in milliseconds: '+datetime);
    }
}

function responseOK(response, obj) {
    if (obj) {
        console.log(JSON.stringify(obj));
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
    'errObject': errObject
};