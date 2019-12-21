'use strict';

var validNumber = require('./validNumber')
var assign      = require('object-assign')

module.exports = function validHour(value, config){
	config = assign({}, config)

	config.twoDigits = config.len == 2

	var meridian = config.meridian

	if (validNumber(value, config)){
		value *= 1

		if (meridian){
			return 0 <= value && value <= 12
		}

		return 0 <= value && value < 24
	}

	return false
}