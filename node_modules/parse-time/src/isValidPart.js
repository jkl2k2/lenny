'use strict';

var validHour     = require('./validHour')
var validMinute   = require('./validMinute')
var validSecond   = require('./validSecond')
var validMeridian = require('./validMeridian')

var VALIDATION_MAP = {
	hour    : validHour,
	minute  : validMinute,
	second  : validSecond,
	meridian: validMeridian
}

/**
 * VALIDATES TIME PART [name, value] eg ['hour', '15']
 *
 * Returns whether the given value is valid for the given time part.
 *
 * EG:
 * 	name: 'hour', value: 15 => true
 * 	name: 'hour', value: '07' => true
 *  name: 'hour', value: 15, config={meridian: true} => false
 *
 *  name: 'minute', value: '05' => true
 *
 *  name: 'second', value: 55 => true
 *  name: 'second', value: 5 => true
 *  name: 'second', value: '5' => false (string without two digits)
 *  name: 'second', value: '5', {twoDigits: false} => true

 *  name: 'meridian', value: 'PM' => true
 *  name: 'meridian', value: 'am' => true
 *  name: 'meridian', value: 'apm' => false
 *
 * @param {String} name
 * @param {Number/String} value
 * @param {Object} config
 * @param {Boolean} config.meridian
 * @param {Boolean} config.twoDigits
 *
 * @return {Boolean}
 */
module.exports = function isValidPart(name, value, config){
	var fn = VALIDATION_MAP[name]

	return !!(fn && fn(value, config))
}