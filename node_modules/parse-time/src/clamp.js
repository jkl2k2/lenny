'use strict';

module.exports = function clamp(time, name, value){
	if (name == 'meridian'){
		return value
	}
	if (name == 'hour'){
		var limit = 24

		if (time.meridian){
			limit = (time.hour || time.minute)? 11: 12
		}

		return value < 0?
				0:
				value > limit?
					limit:
					value
	}

	return value < 0?
				0:
				value > 59?
					59:
					value
}