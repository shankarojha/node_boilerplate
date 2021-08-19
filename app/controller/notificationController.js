const mongoose = require('mongoose')
const logger = require('../libs/loggerLib')
const response = require('../libs/responseLib')
const check = require('../libs/checkLib')
const events = require('events')
/** MODELS */
const NotificationModel = mongoose.model('Notification')
const ExpenseModel = mongoose.model('Expense')
const UserModel = mongoose.model('User')
const HistoryModel = mongoose.model('History')

/** GET UNIQUE ARRAY */

function getUnique(array) {
    var uniqueArray = [];

    // Loop through array values
    for (var value of array) {
        if (uniqueArray.indexOf(value) === -1) { // if value is not there in array push value to uniqueArray
            uniqueArray.push(value);
        }
    }
    return uniqueArray;
}


/** CREATE NEW NOTIFICATION ON NEW EXPENSE */
let notifyOnNewExpense = (expenseData) => {
    let newNotificationOnExpenseCreation = () => {
        return new Promise((resolve, reject) => {
            console.log('notification member:  => '+ expenseData.member)
            for (let x of expenseData.member) {
                console.log('x:'+x)
                NotificationModel.findOne({ email: x }, (err, result) => {
                    if (err) {
                        logger.error(err, 'Notification Controller : newNotificationOnExpenseCreation', 10)
                        reject(err)
                    } else if (check.isEmpty(result)) {
                        let newNotification = new NotificationModel({
                            email: x,
                            message: `New expense added by ${expenseData.createdBy} on ${expenseData.createdOn}`
                        })

                        newNotification.save((err, result) => {
                            if (err) {
                                logger.error(err.message, 'ExpenseController: createExpense', 10)
                            }
                            else {
                                console.log(result)
                                logger.info('notification saved', 'Notification Controller : newNotificationOnExpenseCreation', 10)
                                resolve(result)
                            }
                        })
                    } else {
                        NotificationModel.updateOne({ email: x }, {
                            $push: {
                                message: `New expense added by ${expenseData.createdBy} on ${expenseData.createdOn}`
                            }
                        }, (err, result) => {
                            if (err) {
                                logger.error(err.message, 'ExpenseController: createExpense', 10)
                                reject(err)
                            }
                            else {
                                logger.info('notification saved and updated', 'Notification Controller : newNotificationOnExpenseCreation', 10)
                                console.log('Notification edit result' + result)
                                resolve(result)
                            }
                        })
                    }
                })
            }
        })

    }
    //findExpense(expenseId)
    newNotificationOnExpenseCreation(expenseData)
    .then((resolve)=>{
        logger.info(resolve, 'notification-controller:notifyOnNewExpense',10)
    }).catch((err)=>{
        logger.error(err, 'notification-controller:notifyOnNewExpense',10)
    })

}



module.exports = {
    notifyOnNewExpense: notifyOnNewExpense
}


