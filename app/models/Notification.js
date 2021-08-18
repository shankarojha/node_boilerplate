const mongoose = require('mongoose')

let notificationSchema = new mongoose.Schema({

    notificationId:{
        type:String,
        default:'',
        unique:true
    },

    status:{
        type:String,
        default:'un-seen'
    },

    data:{
        type:String
    },

    message:Object,

    usersToSend:{
        type:String,
        default:''
    },

    purpose:{
        type:String,
        default:''
    }
})

module.exports = mongoose.model('Notification', notificationSchema)