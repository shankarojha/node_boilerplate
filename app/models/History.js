const mongoose = require('mongoose')

let historySchema = new mongoose.Schema({

    id:{
        type:String
    },

    message: []
})

module.exports = mongoose.model('History', historySchema)