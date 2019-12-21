'use strict';

/**
 * See documentation below
 */

var defaults = {}

var MAP = {
	hour: overflowHour,
	minute: overflowMinute,
	second: overflowSecond
}

function overflowHour(values, name, value, config){
	if (values.hour === undefined){
		return
	}

	var overflowHourToMeridian = !config || config.overflowHourToMeridian !== false
	var meridian = values.meridian || config && config.meridian === true
	var limit    = meridian? 12: 23
	var plusOne  = meridian? 12: 24

	var extra = 0

	if (value > limit){
		extra += Math.floor(value / limit)
		value = value % plusOne
	}
	if (value < 0){
		extra = Math.ceil(-value / limit)
		value = plusOne + value
	}

	if (meridian && value === limit && (values.minute > 0 || values.second > 0)){
		extra += 1
		value = 0
	}

	if (meridian && extra % 2 == 1 && overflowHourToMeridian){
		if (typeof meridian == 'string'){
			meridian = meridian.toUpperCase()
		}

		//change meridian
		values.meridian = meridian == 'PM'? 'AM': 'PM'
	}

	values.hour = value
}

function overflowMinuteOrSecond(values, name, value, config, nextName){

	if (values[name] === undefined){
		return
	}

	var extra = 0

	if (value > 59){
		extra += Math.floor(value / 60)
		value = value % 60
	}
	if (value < 0){
		extra -= Math.ceil(-value / 60)
		value = 60 + value
	}

	values[name || 'minute'] = value

	if (extra){
		values[nextName || 'hour'] += extra
	}
}

function overflowMinute(values, name, value, config){
	overflowMinuteOrSecond(values, 'minute', values.minute, config) // minute -> hour
	overflowHour(values, 'hour', values.hour, config) //overflow hour
}

function overflowSecond(values, name, value, config){
	overflowMinuteOrSecond(values, 'second', values.second, config, 'minute') //second -> minute
	overflowMinute(values, 'minute', values.minute, config) //minute -> hour
}

/**
 *
 * This method receives an object with hour, minute and second properties.
 * It adjusts any overflowing values and moves the overflow to the next value:
 *
 * EG: extra seconds go to minute; extra minutes go to hour;
 * hours beyond 23 (in 24 hour format, so without values.meridian specified) restart from 0,
 * or beyond 12:00:00 (when meridian is specified) restart from 0
 *
 * @param  {Object} values [description]
 * @param  {Number} values.hour
 * @param  {Number} values.minute
 * @param  {Number} values.second
 * @param  {Number} values.meridian
 *
 * @param  {String} [name="second"]   "hour"|"minute"|"second"
 * @param  {Number} [value]
 * @param  {Object} config
 *
 * Both {name} and {value} are optional. If not given, they default to "second" and value for second.
 *
 * @return {Object}
 */
module.exports = function(values, name, value, config){

	if (arguments.length == 2){
		config = name
		name   = 'second'
		value  = values[name]
	}

	MAP[name](values, name, value, config || defaults)

	return values
}