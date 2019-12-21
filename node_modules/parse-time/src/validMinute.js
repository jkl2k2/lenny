'use strict';

var validNumber = require('./validNumber')
var assign      = require('object-assign')

module.exports = function validMinute(value, config){

	config = assign({}, config)
	config.twoDigits = config.len == 2

	if (validNumber(value, config)){
		value *= 1

		return 0 <= value && value < 60
	}

	return false
}