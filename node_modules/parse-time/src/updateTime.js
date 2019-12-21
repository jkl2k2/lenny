'use strict';

var assign      = require('object-assign')
var isValidNumber = require('./validNumber')
var isValidPart = require('./isValidPart')
var isValidTime = require('./isValidTime')
var adjustOverflow = require('./adjustOverflow')

var clamp = require('./clamp')

/**
 * @param {Object} time
 * @param {String} name
 * @param {String/Number} value
 * @param {Object} [config]
 * @param {Boolean} [config.clamp=false]
 * @param {Boolean} [config.overflow=true]
 * @param {Boolean} [config.rejectInvalid=false]
 *
 * @return {Object} time
 */

module.exports = function update(time, name, value, config){

	var initial = time
	var touched
	var validNumber = isValidNumber(value, config)
	var validPart   = isValidPart(name, value, config)

	time   = assign({}, time)
	config = config || {}

	if (validNumber){
		value *= 1
	}

	if (validPart || validNumber){
		time[name] = value
	}

	if (!isValidTime(time, config) && config.clamp){
		time[name] = clamp(time, name, time[name])
	}

	if (!isValidTime(time, config)){

		if (config.rejectInvalid){
			return initial
		}

		if (config.overflow !== false){
			time = adjustOverflow(time, config)
		}
	}

	return time
}