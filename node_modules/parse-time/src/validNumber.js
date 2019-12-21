'use strict';

var assign   = require('object-assign')
var defaults = require('./defaults')

module.exports = function validNumber(n, config){
	var valid = !isNaN(n * 1)

	if (config){
		config = assign({}, defaults, config)
	} else {
		config = defaults
	}

	if (valid && typeof n == 'string' && config.twoDigits){
		valid = n.length == 2
	}

	if (valid){
		n = n * 1
		valid = parseInt(n) === n
	}

	return valid
}