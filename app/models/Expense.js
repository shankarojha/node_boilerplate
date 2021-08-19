const mongoose = require('mongoose')

let expenseSchema = new mongoose.Schema({

    ExpenseId:{
        type:String,
        unique:true,
        index:true
    },

    createdBy:{
        type:String,
        required:true
    },

    paidBy:{
        type:String,
        default:''
    },

    debtors: [{email:String,
    paid:{type:Number,
        default:0
    }
    }],

    amount:{
        type:Number
    },

    createdOn:{
        type:Date,
        default:Date.now()
    },

    modifiedOn:{
        type:Date,
        default:Date.now()
    },

    member:[]
        
    
})

module.exports = mongoose.model('Expense',expenseSchema)