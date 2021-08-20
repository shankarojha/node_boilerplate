const mongoose = require('mongoose')

let historySchema = new mongoose.Schema({

    ExpenseId:{
        type:String
    },

    message: []
})

module.exports = mongoose.model('History', historySchema)