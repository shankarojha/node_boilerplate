const socketio = require('socket.io')
const mongoose = require('mongoose')
const logger = require('../libs/loggerLib')
const events = require('events')
const check = require('../libs/checkLib')
const eventEmitter = new events.EventEmitter()

/** MODELS */
const NotificationModel = mongoose.model('Notification')
const HistoryModel = mongoose.model('History')

/** SET SERVER */

let server = (server) => {

    let io = socketio.listen(server);

    let myIo = io.of('/')

    myIo.on('connection', (socket) => {

        /** NOTIFICATION SOCKET */
        
        socket.on('sendNotification', (userEmail) => {
            console.log('sendNotification to :'+ userEmail)
            findAndSendNotification()

            let findAndSendNotification = (userEmail) => {
                let findNotification = () => {
                    return new Promise((resolve,reject)=>{
                        NotificationModel.findOne({email:userEmail},(err,result) =>{
                            if(err){
                                logger.error(err,'socketLib:findNotification',10)
                                reject(err)
                            }else if(check.isEmpty(result.message)){
                                logger.info('no new notification','socketLib:findNotification',10)
                                //socket.emit('no new notification')
                                reject('no new notification')
                            }else{
                                logger.info('notfications found','socketLib:findNotification',10)
                                resolve(result)
                            }
                        })
                    })
                }

                let removeSeenMessage = (notification) => {
                    return new Promise((resolve,reject)=> {
                        NotificationModel.updateOne({email: notification.email},{
                            $set:{
                                message:[]
                            }
                        }, (err,result)=> {
                            if(err){
                                logger.error(err,'SocketLib:removeSeenMessage',10)
                                reject(err)
                            }else{
                                logger.info(result,'SocketLib:removeSeenMessage',10)
                                resolve(notification)
                            }
                        })
                    })
                }

                findNotification(userEmail)
                    .then(removeSeenMessage)
                    .then((resolve)=>{
                        socket.emit("YourNotifications", resolve);
                    }).catch((err)=>{
                        logger.error(err,'SocketLib:removeSeenMessage',10)
                    })
            }
        })

        /** HISTORY SOCKET */

        socket.on('sendHistory', (ExpenseId)=>{
            console.log('send History for:'+ ExpenseId)
            findAndSendHistory()

            let findAndSendHistory = (ExpenseId) => {
                HistoryModel.findOne({ExpenseId:ExpenseId})
                .select("message")
                .exec((err,result)=>{
                    if(err){
                        logger.error(err, 'Send History:SocketLib',10)
                    }else{
                        logger.info('history sent', 'Send History:SocketLib',10)
                        socket.emit('yourHistory',result)
                    }
                })
            }
        })

    })
}

module.exports = {
    setServer:server
}