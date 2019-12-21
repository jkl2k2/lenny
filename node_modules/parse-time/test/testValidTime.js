'use strict'

var valid     = require('../src/isValidPart')
var validTime = require('../src/isValidTime')
var assign    = require('object-assign')

var validHour = function(value, config){
    return valid('hour', value, config)
}

var validMinute = function(value, config){
    return valid('minute', value, config)
}

var validSecond = function(value, config){
    return valid('second', value, config)
}

var validMeridian = function(value, config){
    return valid('meridian', value, config)
}

describe('isValidPart:hour', function(){

    it('should validate hour number', function(){
        validHour(15)
            .should
            .equal(true)
    })

    it('should validate hour string', function(){
        validHour('23')
            .should
            .equal(true)
    })

    it('should invalidate hour string', function(){
        validHour('26')
            .should
            .equal(false)
    })

    it('should invalidate hour without two digits', function(){
        validHour('3', {len: 2})
            .should
            .equal(false)
    })

    it('should validate hour when twoDigits: false', function(){
        validHour('3', { twoDigits: false})
            .should
            .equal(true)
    })

    it('should invalidate hour with twoDigits: true', function(){
        validHour('3', { len: 2})
            .should
            .equal(false)
    })
})

describe('isValidPart:minute', function(){

    it('should validate minute number', function(){
        validMinute(55)
            .should
            .equal(true)
    })

    it('should validate minute string', function(){
        validMinute('56')
            .should
            .equal(true)
    })

    it('should invalidate minute string', function(){
        validMinute('67')
            .should
            .equal(false)
    })

    it('should invalidate minute without two digits', function(){
        validMinute('3', {len: 2})
            .should
            .equal(false)
    })

    it('should validate minute when twoDigits: false', function(){
        validMinute('3', { len: 1})
            .should
            .equal(true)
    })

    it('should invalidate minute with twoDigits: true', function(){
        validMinute('3', { len: 2})
            .should
            .equal(false)
    })
})

describe('isValidPart:minute', function(){

    it('should validate second number', function(){
        validSecond(55)
            .should
            .equal(true)
    })

    it('should validate second string', function(){
        validSecond('56')
            .should
            .equal(true)
    })

    it('should invalidate second string', function(){
        validSecond('67')
            .should
            .equal(false)
    })

    it('should invalidate second without two digits', function(){
        validSecond('3', {len: 2})
            .should
            .equal(false)
    })

    it('should validate second when twoDigits: false', function(){
        validSecond('3', { len: 1})
            .should
            .equal(true)
    })

    it('should invalidate second with twoDigits: true', function(){
        validSecond('3', { len: 2})
            .should
            .equal(false)
    })
})

describe('isValidPart:meridian', function(){

    it('should validate meridian PM', function(){
        validMeridian('pm')
            .should
            .equal(true)

        validMeridian('pM')
            .should
            .equal(true)

        validMeridian('PM')
            .should
            .equal(true)

        validMeridian('Pm')
            .should
            .equal(true)
    })

    it('should validate meridian AM', function(){
        validMeridian('am')
            .should
            .equal(true)

        validMeridian('aM')
            .should
            .equal(true)

        validMeridian('AM')
            .should
            .equal(true)

        validMeridian('Am')
            .should
            .equal(true)
    })

    it('should invalidate', function(){
        validMeridian('pma')
            .should
            .equal(false)

        validMeridian('apM')
            .should
            .equal(false)

        validMeridian('PxM')
            .should
            .equal(false)

        validMeridian('APm')
            .should
            .equal(false)
    })
})

describe('isValidPart:hour:meridian', function(){

    it('should validate 11PM', function(){
        validHour('11', {meridian: 'pm'})
            .should
            .equal(true)
    })

    it('should validate 12PM or 12am', function(){
        validHour('12', {meridian: 'pm'})
            .should
            .equal(true)

        validHour('12', {meridian: 'am'})
            .should
            .equal(true)
    })

    it('should invalidate 13PM or am', function(){
        validHour('13', {meridian: 'pm'})
            .should
            .equal(false)

        validHour('13', {meridian: 'am'})
            .should
            .equal(false)
    })
})

describe('isValidTime', function(){
    it('should validate 24 hour time', function(){
        validTime({
            hour: 12,
            minute: 45,
            second: 56
        }).should
        .equal(true)

        validTime({
            hour: 12,
            minute: 45,
            second: '6'
        }, {twoDigits: false}).should
        .equal(true)

        validTime({
            hour: 12,
            minute: 45,
            second: '6'
        }, {len: 2}).should
        .equal(false)

    })

    it('should invalidate 15:00 am', function(){

        validTime({
            hour: 15,
            minute: 0,
            meridian: 'AM'
        }).should.equal(false)
    })

    it('should validate am/pm', function(){
        validTime({
            hour: 10,
            minute: 34,
            second: 45,
            meridian: 'Am'
        }).should
        .equal(true)
    })

    it('should invalidate on invalid hour', function(){
        validTime({
            hour: 24,
            minute: 45,
            second: 56
        }).should
        .equal(false)
    })

    it('should invalidate on invalid second', function(){
        validTime({
            hour: 24,
            minute: 45,
            second: 67
        }).should
        .equal(false)
    })

    it('should invalidate on invalid minute', function(){
        validTime({
            hour: 24,
            minute: 78,
            second: 6
        }).should
        .equal(false)
    })

    it('should invalidate invalid am/pm', function(){
        validTime({
            hour: 10,
            minute: 34,
            second:45,
            meridian: 'Ams'
        }).should
        .equal(false)
    })

    it('should validate 12:00:00 am/pm', function(){
        validTime({
            hour: 12,
            minute: 0,
            second:0,
            meridian: 'AM'
        }).should
        .equal(true)

        validTime({
            hour: 12,
            minute: 0,
            second:0,
            meridian: 'PM'
        }).should
        .equal(true)

        validTime({
            hour: 12,
            minute: '00',
            second: '0',
            meridian: 'AM'
        }, {twoDigits: false}).should
        .equal(true)
    })

    it('should invalidate > 12:00:00 pm/am', function(){
        validTime({
            hour: 12,
            minute: '00',
            second:'01',
            meridian: 'AM'
        }).should
        .equal(false)
    })
})