'use strict';

var isValidPart = require('./isValidPart')
var assign = require('object-assign')

module.exports = function isValidTime(time, config){

	var validSecond = time.second === undefined || isValidPart('second', time.second, config)

	var validMinute = validSecond && (time.minute === undefined || isValidPart('minute', time.minute, config))
	var validHour   = validMinute && isValidPart('hour', time.hour, assign({meridian: time.meridian}, config))

	var meridian      = time.meridian
	var validMeridian = validHour && (meridian? isValidPart('meridian', meridian, config): true)

	var valid = validMeridian
	if (valid && meridian){
		//for 24 hour clock, we're done
		//BUT there is a special case when we have meridian specified:
		//12:00:00 am/pm is ok, but >= 12:00:01 is not
		var hour = time.hour * 1
		if (hour === 12){
			valid = time.minute * 1 === 0 && time.second * 1 === 0
		}
	}

	return valid
}