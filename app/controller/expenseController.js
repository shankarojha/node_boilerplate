const mongoose = require("mongoose");
const validateInput = require("../libs/paramsValidationLib");
const response = require("../libs/responseLib");
const check = require("../libs/checkLib");
const shortid = require("shortid");
const logger = require("../libs/loggerLib");
const time = require("../libs/timeLib");
const events = require('events');
const eventEmitter = new events.EventEmitter();
const notificationController = require('../controller/notificationController')
/** Models */
const UserModel = mongoose.model("User");
const ExpenseModel = mongoose.model("Expense")
const NotificationModel = mongoose.model("Notification")
/** get the notification controller */

/** create a new EXPENSE */

let createNewExpense = (req, res) => {

    let validateExpenseInput = () => {

        return new Promise((resolve, reject) => {
            if (req.body.paidBy && req.body.debtors) {
                resolve(req)
            } else {
                logger.error('Fields Missing During Expense Creation', 'expenseController: createNewExpense()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate event input

    let createExpense = () => {
        return new Promise((resolve, reject) => {
            let newExpense = new ExpenseModel({

                ExpenseId: shortid.generate(),
                createdBy: req.body.createdBy,
                paidBy: req.body.paidBy,
                member: req.body.paidBy,
                amount: req.body.amount,
                createdOn: time.now(),
                modifiedOn: time.now()
            })

            newExpense.save((err, newExpense) => {
                if (err) {
                    console.log("error while saving new Expense: ", err)
                    logger.error(err.message, 'ExpenseController: createExpense', 10)
                    let apiResponse = response.generate(true, 'Failed to create&save new Expense', 500, null)
                    reject(apiResponse)
                }
                else {
                    let newExpenseObj = newExpense.toObject();
                    console.log("new Expense created " + newExpenseObj)
                    resolve(newExpenseObj)
                }
            })
        })


    }//end of createnewExpense()

    let addDebtors = (newExpense) => {
        return new Promise((resolve, reject) => {

            let arrayCommuted = JSON.parse((req.body.debtors))
            let count = 0
            let len = arrayCommuted.length
            for (let x of arrayCommuted) {
                ExpenseModel.updateOne({ ExpenseId: newExpense.ExpenseId }, {
                    $push: {
                        member: x.email,
                        debtors: { email: x.email, paid: x.paid }
                    }
                }, (err, result) => {
                    if (err) {
                        logger.error(err.message, 'ExpenseController: createExpense:addDebtors', 10)
                        let apiResponse = response.generate(true, 'Failed to create & save new Expense', 500, null)
                        reject(apiResponse)
                    } else {
                        count++
                        logger.info(count, 'ExpenseController: createExpense:addDebtors', 10)
                        if (count === len) {
                            resolve(newExpense)
                        }

                    }
                })
            }
        })
    }
    validateExpenseInput(req, res)
        .then(createExpense)
        .then(addDebtors)
        .then((resolve) => {
            //emitting Expense creation for listening and notifiaction and finally resolving the Expense object
            eventEmitter.emit("new-Expense-created & saved", resolve.ExpenseId);
            let apiResponse = response.generate(false, 'new Expense created successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.send(err);
        })
}

/** handle emitted event from createnewExpense */
eventEmitter.on("new-Expense-created & saved", (ExpenseId) => {
    console.log('eON' + ExpenseId)
    ExpenseModel.findOne({ 'ExpenseId': ExpenseId }, (err, result) => {
        if (err) {
            logger.error(err.message, 'ExpenseController: getSingleExpenseDetails', 10)

        } else if (check.isEmpty(result)) {
            logger.info('No Expense found', 'ExpenseController: getSingleExpenseDetails')

        } else {
            logger.info('Expense found', 'ExpenseController: getSingleExpenseDetails');
            console.log(result.member)
            notificationController.notifyOnNewExpense(result)
        }
    })
})

/** EDIT EXPENSE */

let editExpense = (req, res) => {
    let editBody = () => {
        return new Promise((resolve, reject) => {
            let options = req.body;
            let update = {
                $set: {
                    createdBy: options.createdBy,
                    paidBy: options.paidBy,
                    amount: options.amount,
                    modifiedOn: time.now(),
                },
                $push: {
                    member: options.paidBy
                }
            }
            console.log(req.body.ExpenseId)
            console.log('paidby' + options.paidBy)
            ExpenseModel.updateOne({ ExpenseId: options.ExpenseId }, update)
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'ExpenseController: editExpense', 10)
                        let apiResponse = response.generate(true, 'Failed To edit Expense details', 500, null)
                        res.send(apiResponse)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No Expense Found', 'ExpenseController: editExpense')
                        let apiResponse = response.generate(true, 'No Expenses Found', 404, null)
                        res.send(apiResponse)
                    } else {
                        logger.info('Expense edited successfully', 'ExpenseController:editExpense.editBody', 10)
                        resolve(options.ExpenseId)
                    }
                })
        })
    }


    let addDebtors = (ExpenseId) => {
        return new Promise((resolve, reject) => {
            let arrayDebtors = JSON.parse((req.body.debtors))
            if (!check.isEmpty(arrayDebtors)) {
                console.log('array debtors' + arrayDebtors)
                let count = 0
                let len = arrayDebtors.length
                for (let x of arrayDebtors) {
                    console.log(req.body.ExpenseId)
                    console.log(x)
                    ExpenseModel.updateOne({ ExpenseId: req.body.ExpenseId }, {
                        $push: {
                            debtors: { email: x.email, paid: x.paid },
                            member: x.email
                        }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'ExpenseController: createExpense:addDebtors', 10)
                            let apiResponse = response.generate(true, 'Failed to create & save new Expense', 500, null)
                            reject(apiResponse)
                        } else {
                            count++
                            if(count === len){
                                resolve(ExpenseId)
                            }
                        }
                    })
                }
            } else {
                logger.info('Expense edited successfully', 'ExpenseController:editExpense', 10)
                resolve(ExpenseId)
            }

        })
    }

    let removemember = (ExpenseId) => {
        return new Promise((resolve, reject) => {
            let removeArray = JSON.parse(req.body.removemember)
            if (!check.isEmpty(removeArray)) {
                let count = 0
                let len = removeArray.length
                for (let x of removeArray) {
                    let update = {
                        $pull: {
                            debtors: { email: x },
                            member: x
                        }
                    }
                    ExpenseModel.updateOne({ ExpenseId: req.body.ExpenseId }, update, (err, result) => {
                        if (err) {
                            logger.error(err.message, 'ExpenseController: editExpense:removemember', 10)
                            let apiResponse = response.generate(true, 'Failed to create & save new Expense', 500, null)
                            reject(apiResponse)
                        } else {
                            count++
                            logger.info('Expense edited successfully', 'ExpenseController:removemember', 10)
                            if(count===len){
                                resolve(ExpenseId)
                            }
                        }
                    })
                }
            } else {
                logger.info('Expense edited successfully no member were removed', 'ExpenseController:removemember', 10)
                resolve(ExpenseId)
            }
        })
    }

    editBody(req, res)
        .then(addDebtors)
        .then(removemember)
        .then((resolve) => {
            // emitting edited Expense for notification
            eventEmitter.emit("Expense-edited", resolve);
            console.log(resolve)
            let apiResponse = response.generate(false, 'new Expense edited successfully', 200, resolve)
            res.send(apiResponse)
        }).catch((err) => {
            res.send(err);
        })

} //end of editExpense function.

/** Handle event emitted on editExpense() */

/** eventEmitter.on("Expense-edited", (ExpenseData) => {

    ExpenseModel.findOne({ 'id': ExpenseData })
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'ExpenseController: eventEmitter.on-> new Expense created', 10)

            } else if (check.isEmpty(result)) {
                logger.info('No Expense found', 'ExpenseController: eventEmitter.on-> new Expense created')

            } else {
                logger.info('Expense found', 'ExpenseController: eventEmitter.on-> new Expense created');

                notificationController.createANewNotificationObjOnEdit(result);
            }
        })


}) */

/** DELETE EXPENSE */

let deleteExpense = (req, res) => { // testing not done

    ExpenseModel.findOneAndDelete({ ExpenseId: req.params.ExpenseId }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'ExpenseController: deleteExpense', 10)
            let apiResponse = response.generate(true, 'Failed To delete Expense', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Expense Found', 'ExpenseController: deleteExpense')
            let apiResponse = response.generate(true, 'No Expense Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Expense is deleted  successfully', 200, result)
            res.send(apiResponse)
        }
    })
}

/** GET ALL EXPENSES */
let getAllExpense = (req, res) => {
    ExpenseModel.find()
        .select('-__v -_id')
        .sort('-modifiedOn')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'ExpenseController: getAllExpense', 10)
                let apiResponse = response.generate(true, 'Failed To Find Expense Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Expense found', 'ExpenseController: getAllExpense')
                let apiResponse = response.generate(true, 'No Expense found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Expense found', 'ExpenseController: getAllExpense');
                let apiResponse = response.generate(false, 'All Expense details found', 200, result)
                res.send(apiResponse)
            }
        })
}  // end of getAllExpenses function.

/** GET USER EXPENSES ONLY */

let getExpenseOfAUser = (req, res) => {

    ExpenseModel.find({ $or: [{ member: req.params.email }, { createdBy: req.params.email }] })
        .select('-__v -_id')
        .sort('-modifiedOn')
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Expense Controller: getExpenseOfAUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find Expense Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Expense Found', 'Expense Controller: getAllAssingedExpenseOfAUser', 10)
                let apiResponse = response.generate(true, 'No Expense Found ', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Expenses  Found', 200, result)
                res.send(apiResponse)
            }

        })

} // end of get Expense of A user

/** GET SINGLE EXPENSE DETAILS */

let getSingleExpenseDetails = (req, res) => {
    ExpenseModel.findOne({ 'ExpenseId': req.params.ExpenseId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'ExpenseController: getSingleExpenseDetails', 10)
                let apiResponse = response.generate(true, 'Failed To Find Expense Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Expense found', 'ExpenseController: getSingleExpenseDetails')
                let apiResponse = response.generate(true, 'No Expense details found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Expense found', 'ExpenseController: getSingleExpenseDetails');
                let apiResponse = response.generate(false, 'Expense details found', 200, result)
                res.send(apiResponse)
            }
        })
} // END OF GET SINGLE EXPENSE DETAILS


module.exports = {
    createNewExpense: createNewExpense,
    editExpense: editExpense,
    deleteExpense: deleteExpense,
    getAllExpense: getAllExpense,
    getExpenseOfAUser: getExpenseOfAUser,
    getSingleExpenseDetails: getSingleExpenseDetails
}

