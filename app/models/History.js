const mongoose = require('mongoose')

let historySchema = new mongoose.Schema({

    id:{
        type:String
    },

    historyMessage: Object
})

module.exports = mongoose.model('History', historySchema)