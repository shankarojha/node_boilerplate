const express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const fs = require('fs')
const http = require ('http');
const appConfig  = require ('./config/appConfig')
const morgan = require('morgan')
app.use(morgan('dev'))
app.use(express.json()); // not using body-parser separately
app.use(express.urlencoded({extended:true}))
const path = require('path')
app.use(express.static(path.join(__dirname,'public')))
const mongoose = require('mongoose')
const logger = require('./app/libs/loggerLib')
const routeLoggerMiddleware = require('./app/middlewares/routeLogger')
const globalErrorHandler = require('./app/middlewares/appErrorHandler')
app.use(routeLoggerMiddleware.logIp)
app.use(globalErrorHandler.globalErrorHandler)
const modelsPath = './app/models'
const routesPath = './app/routes'

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next();
  });

//Bootstrap models

fs.readdirSync(modelsPath).forEach(function(file){
    if(~file.indexOf('.js')){
        require(modelsPath+'/'+ file)
    }
});

//Bootstrap routes
fs.readdirSync(routesPath).forEach(function(file){
    if(~file.indexOf('.js')){
        let route = require(routesPath+'/'+file)
        console.log(route + " is route")
        route.setRouter(app)
    }
})



/** call global not found handler after getting the routes */
app.use(globalErrorHandler.globalNotFoundErrorHandler)

/** HTTP server */

const server = http.createServer(app);
console.log(appConfig);
server.listen(appConfig.port)
server.on('error',onError)
server.on('listening', onListening)

/** INITIALIZE SOCKET.IO */

const socketLib = require("./app/libs/socketLib");
const socketServer = socketLib.setServer(server);

function onError(error){
    if(error.syscall !== 'listen'){
        logger.error(error.code + 'not listening', 'serverOnErrorHnadler', 10);
        throw error
    }

    switch (error.code) {
        case 'EACCES':
          logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
          process.exit(1);
          break;
        default:
          logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
          throw error;
      } 
}

function onListening(){
    var bind = typeof server.address() === 'string' ? 'pipe'+ server.address() : 'port'+ server.address().port
    console.log("Listening on" + bind)
    logger.info(
        "listening on "+server.address().port,
        "serverOnLIstenHandler",
        10
    );
    console.log("Listening-------->")
    let db = mongoose.connect(appConfig.db.uri,{ useNewUrlParser:true})
}

/** On Database connection */

mongoose.connection.on("error",function(error){
    console.log("database connection error , Error: " + error)
    logger.error(error, "mongoose connection error handler", 10)
});

mongoose.connection.on("open", function (error){
    if(error){
        console.log("database connection open error , Error: " + error)
        logger.error(error, "database connection open error", 10)
    }else{
        console.log("database connection open")
        logger.info("database connection open", "database connection open handler", 10);
    }
})

module.exports = app;