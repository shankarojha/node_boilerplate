const mongoose = require('mongoose')

let notificationSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: true
    },
    
    message:[]

})

module.exports = mongoose.model('Notification', notificationSchema)