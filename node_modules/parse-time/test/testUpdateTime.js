'use strict'

var update = require('../src/updateTime')

describe('update.clamp', function(){

    it('should clamp 12:66', function(){

        update({
            hour: 12,
            minute: 56
        }, 'minute', 66, {
            clamp: true
        }).should
        .eql({
            hour: 12,
            minute: 59
        })
    })

    it('should clamp 12:66:78 AM', function(){

        update({
            hour: 12,
            minute: 56,
            second: 78,
            meridian: 'AM'
        }, 'minute', 58, {
            clamp: true
        }).should
            .eql({
                hour: 0,
                minute: 59,
                second: 18,
                meridian: 'PM'
            })
    })
})

describe('update.rejectInvalid', function(){
    it('should reject invalid', function(){

        update({
            hour: 11,
            minute: 56,
            meridian: 'AM'
        }, 'minute', 66, {
            rejectInvalid: true
        }).should
            .eql({
                hour: 11,
                minute: 56,
                meridian: 'AM'
            })
    })
})

describe('update', function(){
    it('should reject invalid', function(){

        update({
            hour: 11,
            minute: 56,
            meridian: 'AM'
        }, 'minute', 'das', {
        }).should
            .eql({
                hour: 11,
                minute: 56,
                meridian: 'AM'
            })
    })
})