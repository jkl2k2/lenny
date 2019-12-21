'use strict';

var assign = require('object-assign')
var defaults = require('./defaults')

function trim(str){
	return str.trim()
}

var validHour     = require('./validHour')
var validMinute   = require('./validMinute')
var validSecond   = require('./validSecond')
var validMeridian = require('./validMeridian')

function getHour(value, config){
	if (validHour(value, assign({}, config, config.hour))){
		return value * 1
	}
}

function getMinute(value, config){
	if (validMinute(value, assign({}, config, config.minute))){
		return value * 1
	}
}

function getSecond(value, config){
	if (validSecond(value, assign({}, config, config.second))){
		return value * 1
	}
}

function getMeridian(value, config){
	if (validMeridian(value, assign({}, config, config.meridian))){
		return value
	}
}

function hasMeridian(str){
	var parts = str.split(' ')

	return parts.length > 1
}

var GET_MAP = {
	hour    : getHour,
	minute  : getMinute,
	second  : getSecond,
	meridian: getMeridian
}

function get(name){
	return GET_MAP[name]
}

function parseLast(str, partName, config){
	config = assign({}, config, config? config[partName]: null)

	var withMeridian = config.meridian

	var parts = str.split(' ').map(trim)
	var getFn = get(partName)
	var result = {
		invalid: []
	}

	var partValue
	var meridian

	if (isValidPart(partName, parts[0], config)){
		if (getFn){
			partValue = getFn(parts[0], config)
		}
	} else {
		result.invalid.push({
			name: partName,
			value: parts[0]
		})
	}

	if (withMeridian){
		meridian = getMeridian(parts[1], config)

		if (meridian === undefined){
			result.invalid.push({
				name: 'meridian',
				value: parts[1]
			})
		}
	}

	if (meridian !== undefined){
		result.meridian = meridian
	}
	if (partValue !== undefined){
		result[partName] = partValue
	}

	return result
}

function PARSE(time, config){

	config = assign({}, defaults, config)

	var parts        = time.split(config.separator).map(trim)
	var withMeridian = hasMeridian(parts[parts.length - 1])

	config.meridian = withMeridian

	var invalids = []
	var result = {}
	var hour
	var minute

	if (parts.length > 3){
		return
	}

	if (parts.length == 1){
		//hh am
		assign(result, parseLast(parts[0], 'hour', config))
	}
	if (parts.length == 2){
		//hh:mm am
		hour = getHour(parts[0], config)
		if (hour === undefined){
			invalids.push({
				name: 'hour',
				value: parts[0]
			})
		}
		assign(result, parseLast(parts[1], 'minute', config))
	}
	if (parts.length == 3){
		//hh:mm:ss am
		hour   = getHour(parts[0], config)
		minute = getMinute(parts[1], config)

		if (hour === undefined){
			invalids.push({
				name: 'hour',
				value: parts[0]
			})
		}

		if (minute === undefined){
			invalids.push({
				name: 'minute',
				value: parts[1]
			})
		}

		assign(result, parseLast(parts[2], 'second', config))
	}

	if (result.invalid){
		invalids.push.apply(invalids, result.invalid)
		result.invalid = invalids
	}

	if (hour !== undefined){
		result.hour = hour
	}

	if (minute !== undefined){
		result.minute = minute
	}

	if (!result.invalid.length){
		delete result.invalid
	}

	return result
}

var isValidPart = require('./isValidPart')
var isValidTime = require('./isValidTime')
var updateTime  = require('./updateTime')
var adjustOverflow  = require('./adjustOverflow')

PARSE.isValidPart    = isValidPart
PARSE.isValidTime    = isValidTime
PARSE.updateTime     = updateTime
PARSE.adjustOverflow = adjustOverflow

module.exports = PARSE