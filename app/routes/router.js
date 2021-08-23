const express = require('express')
const appConfig = require('../../config/appConfig')
const userController = require('../controller/userController')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const expenseController = require('../controller/expenseController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`

    app.post(`/signup`, userController.signupFunction)

    app.post(`/login`, userController.loginFunction)

    app.post('/forgotpassword',userController.forgotPassword)

    app.post(`/resetpassword`,authMiddleware.isAuthorized, userController.resetPassword)

    app.post(`/createexpense`,authMiddleware.isAuthorized,expenseController.createNewExpense)

    app.post(`/editexpense`,authMiddleware.isAuthorized,expenseController.editExpense)

    app.post(`/deleteexpense/:ExpenseId`,authMiddleware.isAuthorized,authMiddleware.isAuthorized,expenseController.deleteExpense)

    app.get(`/getexpenseofuser/:email`,authMiddleware.isAuthorized, expenseController.getExpenseOfAUser)

    app.get(`/getexpense/:ExpenseId`,authMiddleware.isAuthorized, expenseController.getSingleExpenseDetails)

    app.post('/updatepaymentInfo',authMiddleware.isAuthorized, expenseController.updatePaymentInfo)

    app.post('/logout',authMiddleware.isAuthorized, userController.logout)
}