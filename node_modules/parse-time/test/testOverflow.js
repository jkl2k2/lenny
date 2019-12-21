'use strict'

var adjustOverflow = require('../src/adjustOverflow')
var assign         = require('object-assign')

function overflow(obj, what, config){
    what = what || 'second'
    return adjustOverflow(obj, what, obj[what], config)
}

function clone(obj){
    return assign({}, obj)
}

var MINUTE = 60
var HOUR = MINUTE * 60

describe('overflow second test', function(){

    it('should return same on no overflow', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50
        }

        var cloned = clone(initial)

        overflow(initial)
            .should
            .eql(cloned)

    })

    it('should overflow to minute', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50 + 4 * MINUTE
        }

        overflow(initial)
            .should
            .eql({
                hour: 10,
                minute: 44,
                second: 50
            })
    })

    it('should overflow to minute and hour', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50 + 4 * MINUTE + 2 * HOUR
        }

        overflow(initial)
            .should
            .eql({
                hour: 12,
                minute: 44,
                second: 50
            })
    })

    it('should overflow to minute and hour beyound 23', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 7 + 5.5 * MINUTE + 15 * HOUR
        }

        overflow(initial)
            .should
            .eql({
                hour: 1,
                minute: 45,
                second: 37
            })
    })

})

describe('overflow minute test', function(){

    it('should return same on no overflow', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50
        }

        var cloned = clone(initial)

        overflow(initial, 'minute')
            .should
            .eql(cloned)

    })

    it('should overflow to hour', function(){

        var initial = {
            hour: 10,
            minute: 60,
            second: 50
        }

        overflow(initial, 'minute')
            .should
            .eql({
                hour: 11,
                minute: 0,
                second: 50
            })
    })

    it('should overflow 24:60', function(){

        var initial = {
            hour: 24,
            minute: 60,
            second: 50
        }

        overflow(initial, 'minute')
            .should
            .eql({
                hour: 1,
                minute: 0,
                second: 50
            })
    })

    it('should overflow hour beyond 23', function(){

        var initial = {
            hour: 10,
            minute: 40 + 60 * 20,
            second: 50
        }

        overflow(initial)
            .should
            .eql({
                hour: 6,
                minute: 40,
                second: 50
            })
    })

})

describe('overflow hour test', function(){

    it('should return same on no overflow', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50
        }

        var cloned = clone(initial)

        overflow(initial, 'hour')
            .should
            .eql(cloned)

    })

    it('should overflow', function(){

        var initial = {
            hour: 24,
            minute: 40,
            second: 50
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 40,
                second: 50
            })
    })

    it('should overflow', function(){

        var initial = {
            hour: 24,
            minute: 40,
            second: 50
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 40,
                second: 50
            })
    })

    it('should overflow 24', function(){

        var initial = {
            hour  : 24,
            minute: 40,
            second: 50
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 40,
                second: 50
            })
    })

})

describe('overflow hour:meridian test', function(){

    it('should return same on no overflow', function(){

        var initial = {
            hour: 10,
            minute: 40,
            second: 50
        }

        var cloned = clone(initial)

        overflow(initial, 'hour')
            .should
            .eql(cloned)

    })

    it('should not overflow 12:00:00 am', function(){

        var initial = {
            hour: 12,
            minute: 0,
            second: 0,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 12,
                minute: 0,
                second: 0,
                meridian: 'AM'
            })
    })

    it('should not overflow 12:00:00 pm', function(){

        var initial = {
            hour: 12,
            minute: 0,
            second: 0,
            meridian: 'PM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 12,
                minute: 0,
                second: 0,
                meridian: 'PM'
            })
    })

    it('should overflow 12:01:50 pm', function(){

        var initial = {
            hour: 12,
            minute: 1,
            second: 50,
            meridian: 'PM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 1,
                second: 50,
                meridian: 'AM'
            })
    })

    it('should overflow -01:01:50 pm', function(){

        var initial = {
            hour: -1,
            minute: 1,
            second: 50,
            meridian: 'PM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 11,
                minute: 1,
                second: 50,
                meridian: 'AM'
            })
    })

    it('should overflow 12:45:56 am', function(){

        var initial = {
            hour: 12,
            minute: 45,
            second: 56,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 45,
                second: 56,
                meridian: 'PM'
            })
    })

    it('should overflow 13:am', function(){

        var initial = {
            hour: 13,
            minute: 10,
            second: 23,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 1,
                minute: 10,
                second: 23,
                meridian: 'PM'
            })
    })

    it('should overflow 23:10:23:am', function(){

        var initial = {
            hour: 23,
            minute: 10,
            second: 23,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 11,
                minute: 10,
                second: 23,
                meridian: 'PM'
            })
    })

    it('should overflow 23:10:23:am', function(){

        var initial = {
            hour: 23,
            minute: 10,
            second: 23,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 11,
                minute: 10,
                second: 23,
                meridian: 'PM'
            })
    })

    it('should correctly overflow:overflowHourToMeridian:false 23:10:23:am', function(){

        var initial = {
            hour: 23,
            minute: 10,
            second: 23,
            meridian: 'AM'
        }

        overflow(initial, 'hour', {
            overflowHourToMeridian: false
        })
            .should
            .eql({
                hour: 11,
                minute: 10,
                second: 23,
                meridian: 'AM'
            })
    })

    it('should overflow 24:10:23:am', function(){

        var initial = {
            hour: 24,
            minute: 10,
            second: 23,
            meridian: 'AM'
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 10,
                second: 23,
                meridian: 'AM'
            })
    })

    it('should overflow', function(){

        var initial = {
            hour: 24,
            minute: 40,
            second: 50
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 40,
                second: 50
            })
    })

    it('should overflow 24', function(){

        var initial = {
            hour  : 24,
            minute: 40,
            second: 50
        }

        overflow(initial, 'hour')
            .should
            .eql({
                hour: 0,
                minute: 40,
                second: 50
            })
    })

})