const mongoose = require('mongoose')
const logger = require('../libs/loggerLib')
const response = require('../libs/responseLib')
const check = require('../libs/checkLib')
const events = require('events')
const nodemailer = require('nodemailer')
/** MODELS */
const NotificationModel = mongoose.model('Notification')

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

/** SETUP NODE-MAILER */

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'splitexpensepro@gmail.com',
      pass: 'shan2895kar'
    }
  });

/** CREATE NEW NOTIFICATION ON NEW EXPENSE */
let notifyOnNewExpense = (expenseData) => {
    let newNotificationOnExpenseCreation = () => {
        return new Promise((resolve, reject) => {
            console.log('notification member:  => '+ expenseData.member)
            let uniqueMemberArray = getUnique(expenseData.member)
            let count = 0
            let len = uniqueMemberArray.length
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

                                /** SEND MAIL */
                                let mailOptions = {
                                    from: 'splitexpensepro@gmail.com',
                                    to: x,
                                    subject: 'New Expense Added',
                                    text: `New expense added by ${expenseData.createdBy} on ${expenseData.createdOn}`
                                  };
                              
                                  transporter.sendMail(mailOptions, function (error, result) {
                                    if (error) {
                                      console.log(error);
                                      logger.error(
                                        error,
                                        "UserController: forgotpassword sendmail",
                                        10
                                      );
                                    } else {
                                      console.log('mailsent to: ' + result.response)
                                    }
                                  });
                                /**SEND MAIL END */
                                count ++

                                if(count===len){
                                    resolve(result)
                                }
                                
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

                                /** SEND MAIL */
                                let mailOptions = {
                                    from: 'splitexpensepro@gmail.com',
                                    to: x,
                                    subject: 'New Expense Added',
                                    text: `New expense added by ${expenseData.createdBy} on ${expenseData.createdOn}`
                                  };
                              
                                  transporter.sendMail(mailOptions, function (error, result) {
                                    if (error) {
                                      console.log(error);
                                      logger.error(
                                        error,
                                        "UserController: forgotpassword sendmail",
                                        10
                                      );
                                    } else {
                                      console.log('mailsent to: ' + result.response)
                                    }
                                  });
                                /**SEND MAIL END */

                                count ++
                                
                                if(count===len){
                                    resolve(result)
                                }
                            }
                        })
                    }
                })
            }
        })

    }
    newNotificationOnExpenseCreation(expenseData)
    .then((resolve)=>{
        logger.info(resolve, 'notification-controller:notifyOnNewExpense',10)
    }).catch((err)=>{
        logger.error(err, 'notification-controller:notifyOnNewExpense',10)
    })

}

/** CREATE NEW NOTIFICATION ON EDIT EXPENSE */

let notifyOnExpenseEdit = (expenseData) => {
    let newNotificationOnExpenseCreation = () => {
        return new Promise((resolve, reject) => {
            console.log('notification member:  => '+ expenseData.result.member)
            let uniqueMemberArray = getUnique(expenseData.result.member)

            let count = 0
            let len = uniqueMemberArray.length
            for (let x of uniqueMemberArray) {
                console.log('x:'+x)
                NotificationModel.findOne({ email: x }, (err, result) => {
                    if (err) {
                        logger.error(err, 'Notification Controller : newNotificationOnExpenseCreation', 10)
                        reject(err)
                    } else if (check.isEmpty(result)) {
                        let newNotification = new NotificationModel({
                            email: x,
                            message: `Expense with ExpenseId : ${expenseData.result.ExpenseId} edited by ${expenseData.userEmail} on ${expenseData.result.modifiedOn}`
                        })

                        newNotification.save((err, result) => {
                            if (err) {
                                logger.error(err.message, 'ExpenseController: createExpense', 10)
                            }
                            else {
                                console.log(result)
                                logger.info('notification saved', 'Notification Controller : newNotificationOnExpenseCreation', 10)

                                /** SEND MAIL */
                                let mailOptions = {
                                    from: 'splitexpensepro@gmail.com',
                                    to: x,
                                    subject: 'New Expense Added',
                                    text: `Expense with ExpenseId : ${expenseData.result.ExpenseId} edited by ${expenseData.userEmail} on ${expenseData.result.modifiedOn}`
                                  };
                              
                                  transporter.sendMail(mailOptions, function (error, result) {
                                    if (error) {
                                      console.log(error);
                                      logger.error(
                                        error,
                                        "UserController: forgotpassword sendmail",
                                        10
                                      );
                                    } else {
                                      console.log('mailsent to: ' + result.response)
                                    }
                                  });
                                /**SEND MAIL END */
                                count++

                                if(count === len){
                                    resolve(result)
                                }
                                
                            }
                        })
                    } else {
                        NotificationModel.updateOne({ email: x }, {
                            $push: {
                                message: `Expense with ExpenseId : ${expenseData.result.ExpenseId} edited by ${expenseData.userEmail} on ${expenseData.result.modifiedOn}`
                            }
                        }, (err, result) => {
                            if (err) {
                                logger.error(err.message, 'ExpenseController: createExpense', 10)
                                reject(err)
                            }
                            else {
                                logger.info('notification saved and updated', 'Notification Controller : newNotificationOnExpenseCreation', 10)
                                console.log('Notification edit result' + result)

                                /** SEND MAIL */
                                let mailOptions = {
                                    from: 'splitexpensepro@gmail.com',
                                    to: x,
                                    subject: 'New Expense Added',
                                    text: `Expense with ExpenseId : ${expenseData.result.ExpenseId} edited by ${expenseData.userEmail} on ${expenseData.result.modifiedOn}`
                                  };
                              
                                  transporter.sendMail(mailOptions, function (error, result) {
                                    if (error) {
                                      console.log(error);
                                      logger.error(
                                        error,
                                        "UserController: forgotpassword sendmail",
                                        10
                                      );
                                    } else {
                                      console.log('mailsent to: ' + result.response)
                                    }
                                  });
                                /**SEND MAIL END */

                                if(count === len){
                                    resolve(result)
                                }
                            }
                        })
                    }
                })
            }
        })

    }
    newNotificationOnExpenseCreation(expenseData)
    .then((resolve)=>{
        logger.info(resolve, 'notification-controller:notifyOnNewExpense',10)
    }).catch((err)=>{
        logger.error(err, 'notification-controller:notifyOnNewExpense',10)
    })

}



module.exports = {
    notifyOnNewExpense: notifyOnNewExpense,
    notifyOnExpenseEdit:notifyOnExpenseEdit
}


