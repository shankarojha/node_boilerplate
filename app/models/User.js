const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    userId:{
        type:String,
        default:'',
        index:true,
        unique:true
    },

    firstName:{
        type:String,
        default:'',
    },

    lastName:{
        type:String,
        default:''
    },

    email:{
        type:String,
        unique:true
    },

    password:{
        type:String,
        default:'thisispassword'
    },

    mobile:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('User', userSchema);