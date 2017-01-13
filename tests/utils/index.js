var querystring = require('querystring');

var baseURL = '/api/smr/v1'; // It can be got from swagger.yml

var testData = {
	site: {
		siteid: '3IFC',
		location: 'Seoul/Korea'
	},
	room: {
		roomid: '12M12/Monitor/10/3IFC',
		floor: 10,
		capacity: 10,
		bigCapacity: 100,
		invalidCapacity: 0,
		attendees: 2,
		invalidAttendees: 0,
		purpose: 'mocha test'
	},
	time: {
		based: {
			start: '2017-03-24T14:30:00.000Z',
			end:   '2017-03-24T15:30:00.000Z',
		},
		available1: {
			start: '2017-03-24T13:30:00.000Z',
			end:   '2017-03-24T14:30:00.000Z',
		},
		available2: {
			start: '2017-03-24T15:30:00.000Z',
			end:   '2017-03-24T16:30:00.000Z',
		},
		conflict1: {
			start: '2017-03-24T14:00:00.000Z',
			end:   '2017-03-24T15:00:00.000Z',
		},
		conflict2: {
			start: '2017-03-24T14:40:00.000Z',
			end:   '2017-03-24T15:20:00.000Z',
		},
		conflict3: {
			start: '2017-03-24T15:00:00.000Z',
			end:   '2017-03-24T16:00:00.000Z',
		},
		conflict4: {
			start: '2017-03-24T14:00:00.000Z',
			end:   '2017-03-24T16:00:00.000Z',
		},
		invalid1: {
			start: '2017-03-24T14:30:00.000Z',
			end:   '2017-03-24T14:30:00.000Z',
		},
		invalid2: {
			start: '2017-01-01T00:00:00.000Z',
			end:   '2017-08-01T00:00:00.000Z',
		},
		freebusy1: {
			start: '2017-03-24T00:00:00.000Z',
			end:   '2017-03-25T00:00:00.000Z',
		},
		search1: {
			start: '2017-03-24T00:00:00.000Z',
			end:   '2017-03-25T00:00:00.000Z',	
		}
	},
	user : {
		userid: 'john.doe@acme.ibm.com',
		name: 'John Doe/ACME',
		email: 'john.doe@acme.ibm.com',
		phone: '+82-01-1234-0000'
	}
};


module.exports.buildURL = function (path, queryobj) {
	var url = baseURL + path;
	if (queryobj) {
		url += ('?' + querystring.stringify(queryobj));
	}
	return url;
}

module.exports.getTestData = function () {
	return Object.assign({}, testData);
}