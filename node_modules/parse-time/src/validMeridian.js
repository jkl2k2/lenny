'use strict';

module.exports = function validMeridian(value){
	if (!value){
		return false
	}

	value = value.toUpperCase()

	return value == 'AM' || value == 'PM'
}