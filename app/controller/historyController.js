const mongoose = require('mongoose')
const logger = require('../libs/loggerLib')
const response = require('../libs/responseLib')
const check = require('../libs/checkLib')
const events = require('events')
const nodemailer = require('nodemailer')
const Notification = require('../models/Notification')

/** MODELS */
const HistoryModel = mongoose.model('History')

/** HISTORY ON EDIT EXPENSE */


//                 result: result,
//                 userEmail: resolveInfo.userEmail,
//                 emailEdited:resolveInfo.emailEdited,
//                 paid:resolveInfo.paid


let createHistoryOnEdit = (expenseData) => {
    HistoryModel.findOne({ExpenseId:expenseData.result.ExpenseId},(err,result)=>{
        if(err){
            logger.error(err, 'History Controller : createHistoryOnEdit1', 10)
        }else if(check.isEmpty(result)){
            let newHistory = new HistoryModel({
                ExpenseId:expenseData.result.ExpenseId,
                message:`${expenseData.userEmail} has edited expense with expenseId: ${expenseData.result.ExpenseId} on ${expenseData.result.modifiedOn}`
            })
            newHistory.save((err,result)=>{
                if (err) {
                    logger.error(err.message, 'ExpenseController: createExpense', 10)
                }
                else {
                    console.log(result)
                    logger.info('History saved', 'History Controller : newHistoryOnExpenseCreation', 10)
                }
            })
        }else{
            HistoryModel.updateOne({ ExpenseId:expenseData.result.ExpenseId}, {
                $push: {
                    message: `${expenseData.userEmail} has edited expense with expenseId: ${expenseData.result.ExpenseId} on ${expenseData.result.modifiedOn}`
                }
            }, (err, result) => {
                if (err) {
                    logger.error(err.message, 'ExpenseController: createExpense', 10)
                }
                else {
                    logger.info('History saved and updated', 'History Controller : newHistoryOnExpenseCreation', 10)
                    console.log('History edit result' + result)   
                }
            })
        }
    })
}

let createHistoryOnUpdate = (expenseData) => {
    HistoryModel.findOne({ExpenseId:expenseData.result.ExpenseId},(err,result)=>{
        if(err){
            logger.error(err, 'History Controller : createHistoryOnEdit1', 10)
        }else if(check.isEmpty(result)){
            let newHistory = new HistoryModel({
                ExpenseId:expenseData.result.ExpenseId,
                message:`${expenseData.userEmail} has updated ${expenseData.emailEdited}'s payment to ${expenseData.paid} expense with expenseId: ${expenseData.result.ExpenseId} on ${expenseData.result.modifiedOn}`
            })
            newHistory.save((err,result)=>{
                if (err) {
                    logger.error(err.message, 'ExpenseController: createExpense', 10)
                }
                else {
                    console.log(result)
                    logger.info('History saved', 'History Controller : newHistoryOnExpenseCreation', 10)
                }
            })
        }else{
            HistoryModel.updateOne({ ExpenseId:expenseData.result.ExpenseId}, {
                $push: {
                    message: `${expenseData.userEmail} has updated ${expenseData.emailEdited}'s payment to ${expenseData.paid} expense with expenseId: ${expenseData.result.ExpenseId} on ${expenseData.result.modifiedOn}`
                }
            }, (err, result) => {
                if (err) {
                    logger.error(err.message, 'ExpenseController: createExpense', 10)
                }
                else {
                    logger.info('History saved and updated', 'History Controller : newHistoryOnExpenseCreation', 10)
                    console.log('History edit result' + result)   
                }
            })
        }
    })
}

module.exports = {
    createHistoryOnEdit:createHistoryOnEdit,
    createHistoryOnUpdate:createHistoryOnUpdate
}