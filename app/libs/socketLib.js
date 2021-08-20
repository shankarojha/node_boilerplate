const socketio = require('socket.io')
const mongoose = require('mongoose')
const logger = require('../libs/loggerLib')
const events = require('events')
const check = require('../libs/checkLib')
const eventEmitter = new events.EventEmitter()

/** MODELS */
const NotificationModel = mongoose.model('Notification')

/** SET SERVER */

let server = (server) => {

    let io = socketio.listen(server);

    let myIo = io.of('/')

    myIo.on('connection', (socket) => {
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
    })
}

module.exports = {
    setServer:server
}