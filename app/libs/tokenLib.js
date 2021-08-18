const jwt = require('jsonwebtoken')
const shortId = require('shortid')
const secretKey = "someRandomSecretKey@123"

let generateToken = (data, callback) =>{
    try {
        let claims = {
            jwtid: shortId.generate(),
            iat:Date.now(),
            exp:Date.now() + 1000*60*30,
            sub:'authToken',
            iss:'expense-splitter',
            data:data
        }

        let tokenDetails = {
            token:jwt.sign(claims,secretKey),
            tokenSecret:secretKey
        }

        callback(null,tokenDetails)
    } catch (error) {
        cb(error,null)
    }
} // generateToken ends


/** verify claim with secretKey */
let verifyClaim = (token,secretKey,cb) =>{
    jwt.verify(token, secretKey, function (err,decoded){
        if(err){
            console.log(`error verify token:${err}`)
            cb(err,null)
        }else{
            cb(null,decoded)
        }
    })
} // end verifyClaim with secretkey

/** verify claim without secret key */
let verifyClaimWithoutSecret = (token,cb) =>{
    jwt.verify(token,secretKey, function(err,decoded){
        if(err){
            console.log(`error verify token without secret:${err}`)
            cb(err,null)
        }else{
            cb(null,decoded)
        }
    })
}

module.exports = {
    generateToken:generateToken,
    verifyClaim:verifyClaim,
    verifyClaimWithoutSecret:verifyClaimWithoutSecret
}