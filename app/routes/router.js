const express = require('express')
const appConfig = require('../../config/appConfig')
const userController = require('../controller/userController')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const expenseController = require('../controller/expenseController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`

    // defining routes.

    // params: firstName, lastName, email, mobile, password.
    app.post(`${baseUrl}/signup`, userController.signupFunction)
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/signup api for user signup.
     *
     * @apiParam {string} firstName firstName of the user. (body params) (required)
     * @apiParam {string} lastName lastName of the user. (body params) (required)
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {number} mobile mobile Number of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User created or updated",
            "status": 200,
            "data": {
                "userId": "dKaoliVLi",
                "firstName": "ram",
                "lastName": "hilton",
                "userName": "ram@gmail.com",
                "email": "ram@gmail.com",
                "mobileNumber": 7992202172,
                "socialLoginFlag": false,
                "localLoginFlag": true,
                "_id": "6d85a519bf182d249c3eb598",
                "__v": 0
            }
        }
    */
    
    
    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction)
     /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "ulkhbasjkadI1NiIsInR5cCI6IkpXVCJ9.ghjik3RpZCI6IlVPS2duMnVtNyIsImlhdCI6MTU2Mzk5MzYyNTg1MSwiZXhwIjoxNTY0MDgwMDI1ODUxLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZC1wMS1Jc3N1ZVRyYWNrZXJUb29sIiwiZGF0YSI6eyJ1c2VySWQiOiJzTmF6T3VWTGkiLCJmaXJzdE5hbWUiOiJyaWNrZXkiLCJsYXN0TmFtZSI6InBvaW50aW5nIiwidXNlck5hbWUiOoPugWNrZXlAZ21haWwuY29tIiwiZW1haWwiOiJyaWNrKLOAZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjo5ODAwOTc4OTU2LCJzb2NpYWxMb2dpbkZsYWciOmZhbHNlLCJsb2NhbExvZ2ohyrtnZyI6dHJ1ZX19.wnokKu5unc-8l2JyLloJfggi5axij-kjhee85HVlJr0",
                "userDetails": {
                    "userId": "dKaoliVLi",
                    "firstName": "ram",
                    "lastName": "hilton",
                    "userName": "ram@gmail.com",
                    "email": "ram@gmail.com",
                    "mobileNumber": 7992202173
                }
            }
        }
    */


     // params: email, password.
    app.post(`${baseUrl}/forgotpassword`,userController.forgotPassword)
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/forgotpassword api for sending link in an email for resetting password.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "reset link has been sent to your email id successfully",
            "status": 200,
            "data": {
                mailsent to: 250 2.0.0 OK  1629880195 c133sm21409268pfb.39 - gsmtp
                }
            }
        }
    */


    
    // params: userId, password, authToken.
    app.post(`${baseUrl}/resetpassword`,authMiddleware.isAuthorized, userController.resetPassword)
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/resetpassword  for user password reset.
     *
     * @apiParam {string} authToken authToken of the user. (body params) (required)
     * @apiParam {string} userId userId of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User details Password reset",
            "status": 200,
            "data": {
                {"n":1,"nModified":1,"ok":1}
                }
            }
        }
    */
    
    // params: userId, authtoken
    app.post(`${baseUrl}/logout`,authMiddleware.isAuthorized, userController.logout)
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null
        }
    */

    // params: authToken, ExpemseName, amount, paidBy, debtors
    app.post(`${baseUrl}/createexpense`,authMiddleware.isAuthorized,expenseController.createNewExpense)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {post} /api/v1/createexpense to create an expense.
     *
     * @apiParam {string} ExpenseName Expense name of the user. (bodyparams) (required)
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} paidBy Email of the payer. (body params) (required)
     * @apiParam {number} amount Amount of the expense. (body params) (required)
     * @apiParam {Object[]} debters Debters in the expense. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "New expense created successfully",
            "status": 200,
            "data": {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            }
        }
    */

    // params: authToken, ExpenseId, amount, removeMembers, debtors.
    app.post(`${baseUrl}/editexpense`,authMiddleware.isAuthorized,expenseController.editExpense)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {post} /api/v1/editexpense to edit expense.
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} ExpenseId Expense Id of the expense. (body params) (required)
     * @apiParam {number} amount Amount of the expense. (body params) (required)
     * @apiParam {Object[]} debters Debters in the expense. (body params) (required)
     * @apiParam {Object[]} removeMembers Members to remove from the expense. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Expense edited successfully",
            "status": 200,
            "data": {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            }
        }
    */

    // params: ExpenseId.
    app.post(`${baseUrl}/deleteexpense`,authMiddleware.isAuthorized, expenseController.deleteExpense)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {post} /api/v1/deleteexpense/ExpenseId to delete a expense.
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} ExpenseId ExpenseId of the expense to be removed. (body params) (required).
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Expense edited successfully",
            "status": 200,
            "data": {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            }
        }
    */

    // params: email.
    app.get(`${baseUrl}/getexpenseofuser/:email`,authMiddleware.isAuthorized, expenseController.getExpenseOfAUser)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {get} /api/v1/getexpenseofuser/email to get all the expenses of the user.
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} email email of the user. (query params) (required).
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Expense edited successfully",
            "status": 200,
            "data": [
                {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            },
            {
                 ExpenseId: "fgdF8g8",
                ExpenseName: "Expense 2",
                createdBy: ram@gmail.com,
                paidBy: dwayne@gmail.com,
                member: ["dwayne@gmail.com", "luffy@gmail.com", "sam@gmail.com"],
                amount: 2000,
                createdOn: time.now(),
                modifiedOn: time.now()   
            }
            ]
        }
    */

    // params: ExpenseId.
    app.get(`${baseUrl}/getexpense/:ExpenseId`,authMiddleware.isAuthorized, expenseController.getSingleExpenseDetails)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {get} /api/v1/getexpense/:ExpenseId to get details of the expense.
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} ExpenseId ExpenseId of the expense to be removed. (query params) (required).
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Expense details found",
            "status": 200,
            "data": {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            }
        }
    */
    
    // params: authToken, email, paid, ExpenseId, userEmail
    app.post(`${baseUrl}/updatepaymentInfo`,authMiddleware.isAuthorized, expenseController.updatePaymentInfo)
    /**
     * @apiGroup Expense
     * @apiVersion  1.0.0
     * @api {post} /api/v1/updatepaymentInfo to update details of the expense payments.
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
     * @apiParam {string} ExpenseId ExpenseId of the expense to be removed. (body params) (required).
     * @apiParam {string} email email of the user to be updated. (body params) (required).
     * @apiParam {string} userEmail userEmail of the email of user. (body params) (required).
     * @apiParam {number} paid paid of the expense to be updated. (body params) (required).
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Expense details found",
            "status": 200,
            "data": {
                ExpenseId: "Jhghy34",
                ExpenseName: "Expense 1",
                createdBy: "sam@gmail.com",
                paidBy: "luffy@gmail.com",
                member: ["luffy@gmail.com","sam@gmail.com", "david@yahoo.com"],
                debters: ["david@yahoo.com","sam@gmail.com"]
                amount: 5000,
                createdOn: time.now(),
                modifiedOn: time.now()
            }
        }
    */

}