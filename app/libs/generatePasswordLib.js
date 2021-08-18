const bcrypt = require('bcryptjs')
const saltRounds = 10
const logger = require('../libs/loggerLib')

/** Using bcrypt.js library to generate and comapare password */

let hashPassword = (plainPassword) =>{
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(plainPassword,salt)
    return hash
}

let comparePassword = (oldPassword, hashedPassword, cb) => {
    bcrypt.compare(oldPassword,hashedPassword,(err, result)=>{
        if(err){
            logger.error(err.message,'bcrypt comparison error', 5)
            cb(err,null)
        }else{
            cb(null,result)
        }
    })
}

let comparePasswordSync = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword)
} // end compare password

module.exports = {
    hashPassword:hashPassword,
    comparePassword:comparePassword,
    comparePasswordSync:comparePasswordSync
}