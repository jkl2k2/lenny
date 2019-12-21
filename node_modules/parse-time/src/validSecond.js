'use strict';

var validMinute = require('./validMinute')
var assign      = require('object-assign')

module.exports = function validSecond(value, config){
	config = assign({}, config)
	config.twoDigits = config.len == 2

	return validMinute(value, config)
}