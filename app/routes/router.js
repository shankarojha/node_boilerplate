const express = require('express')
const appConfig = require('../../config/appConfig')
const userController = require('../controller/userController')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const expenseController = require('../controller/expenseController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`

    

}
