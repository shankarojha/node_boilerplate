const mongoose = require('mongoose')
const timeLib = require('../libs/timeLib')

let authSchema = new mongoose.Schema({
    userId:{
        type:String,
        unique:true
    },

    authToken:{
        type:String,
    },

    tokenSecret:{
        type:String
    },

    tokenGenerationTime:{
        type:Date,
        default:timeLib.now()
    }
})

module.exports = mongoose.model('Auth',authSchema)