const mongoose = require("mongoose");
const validateInput = require("../libs/paramsValidationLib");
const response = require("../libs/responseLib");
const check = require("../libs/checkLib");
const shortid = require("shortid");
const passwordLib = require("../libs/generatePasswordLib");
const token = require("../libs/tokenLib");
const logger = require("../libs/loggerLib");
const time = require("../libs/timeLib");
const nodemailer = require('nodemailer');
/** Models */
const UserModel = mongoose.model("User");
const AuthModel = mongoose.model("Auth");

/** Create new user */

let signupFunction = (req, res) => {
  /** check for user's input(validate)*/
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (!validateInput.Email(req.body.email)) {
          let apiResponse = response.generate(
            true,
            "Enetered email doesnot meet requirements",
            400,
            null
          );
          reject(apiResponse);
        } else if (!validateInput.Password(req.body.password)) {
          let apiResponse = response.generate(
            true,
            "Enetered password doesnot meet requirements",
            400,
            null
          );
          reject(apiResponse);
        } else {
          resolve(req);
        }
      } else {
        logger.error(
          "Field Missing During User Creation",
          "userController: createUser()",
          5
        );
        let apiResponse = response.generate(
          true,
          "One or More Parameter(s) is missing",
          400,
          null
        );
        reject(apiResponse);
      }
    });
  }; // end validateInput

  let createUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ email: req.body.email }, (err, result) => {
        if (err) {
          logger.error(err.message, "user-controller", 10);
          let apiResponse = response.generate(
            true,
            "Create user failed",
            500,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(result)) {
          let newUser = new UserModel({
            userId: shortid.generate(),
            firstName: req.body.firstName.toLowerCase(),
            lastName: req.body.lastName.toLowerCase(),
            email: req.body.email.toLowerCase(),
            password: passwordLib.hashPassword(req.body.password),
            mobile: req.body.mobile,
          });

          // save new user info
          newUser.save((err, result) => {
            if (err) {
              logger.error(err.message, "userController: createUser", 10);
              let apiResponse = response.generate(
                true,
                "Failed to create new User",
                500,
                null
              );
              reject(apiResponse);
            } else {
              let userObject = result.toObject();
              resolve(userObject);
            }
          });
        } else {
          logger.error(
            "User email already exist",
            "userController: createUser",
            4
          );
          let apiResponse = response.generate(
            true,
            "User email already exist",
            403,
            null
          );
          reject(apiResponse);
        }
      });
    });
  }; // end createUser function

  validateUserInput(req, res)
    .then(createUser)
    .then((resolve) => {
      let apiResponse = response.generate(
        false,
        "User created or updated",
        200,
        resolve
      );
      res.send(apiResponse);
    })
    .catch((error) => {
      res.send(error);
    });
};

/** Login function */

let loginFunction = (req, res) => {
  /** find user */
  let findUser = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        UserModel.findOne({ email: req.body.email }).exec((err, result) => {
          if (err) {
            logger.error(
              "Failed to retrieve user data",
              "userController:loginfunction.findUser()",
              10
            );
            let apiResponse = response.generate(
              true,
              "Failed To Find User Details",
              500,
              null
            );
            reject(apiResponse);
          } else if (check.isEmpty(result)) {
            logger.error(
              "Failed to find user",
              "userController:loginfunction.findUser()",
              10
            );
            let apiResponse = response.generate(
              true,
              "Failed To Find User",
              404,
              null
            );
            reject(apiResponse);
          } else {
            resolve(result);
          }
        });
      } else {
        let apiResponse = response.generate(
          true,
          "Enter email address to login",
          400,
          null
        );
        reject(apiResponse);
      }
    });
  }; // end find User function

  /** compare and validate password */
  let validateUserPassword = (userDetails) => {
    return new Promise((resolve, reject) => {
      let checkPassword = passwordLib.comparePasswordSync(
        req.body.password,
        userDetails.password
      );
      if (checkPassword === true) {
        let userDetailsObj = userDetails.toObject();
        delete userDetailsObj.password;
        delete userDetailsObj._id;
        delete userDetailsObj.__v;
        resolve(userDetailsObj);
      } else {
        logger.info(
          "Invalid Password",
          "userController: validatePassword()",
          10
        );
        let apiResponse = response.generate(
          true,
          "Invalid Password, Login Failed",
          400,
          null
        );
        reject(apiResponse);
      }
    });
  };

  /** generate token after correct password */
  let generateToken = (userDetails) => {
    return new Promise((resolve, reject) => {
      token.generateToken(userDetails, (err, tokenDetails) => {
        if (err) {
          logger.error(
            "failed to generate token",
            "userController:generateToken()",
            10
          );
          apiResponse = response.generate(
            true,
            "Failed To Generate Token",
            500,
            null
          );
          reject(apiResponse);
        } else {
          tokenDetails.userId = userDetails.userId;
          tokenDetails.userDetails = userDetails;
          resolve(tokenDetails);
        }
      });
    });
  }; // end generateToken

  /** Save the generated token */

  let saveToken = (tokenDetails) => {
    return new Promise((resolve, reject) => {
      AuthModel.findOne({ userId: tokenDetails.userId }, (err, result) => {
        if (err) {
          logger.error(
            "Failed to save token",
            "userController:login().saveToken()",
            10
          );
          let apiResponse = response.generate(
            true,
            "Failed To Generate Token",
            500,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(result)) {
          // create new collection in db
          let newAuthToken = new AuthModel({
            userId: tokenDetails.userId,
            authToken: tokenDetails.token,
            tokenSecret: tokenDetails.tokenSecret,
            tokenGenerationTime: time.now(),
          });

          newAuthToken.save((err, result) => {
            if (err) {
              logger.error(
                "Failed to save new token",
                "userController:login().saveToken()",
                10
              );
              let apiResponse = response.generate(
                true,
                "Failed To Generate Token",
                500,
                null
              );
              reject(apiResponse);
            } else {
              let response = {
                authToken: result.authToken,
                userDetails: tokenDetails.userDetails,
              };
              resolve(response);
            }
          });
        } else {
          // user already present so just update existing db
          result.authToken = tokenDetails.authToken;
          result.tokenSecret = tokenDetails.tokenSecret;
          result.tokenGenerationTime = time.now();
          result.save((err, updateToken) => {
            if (err) {
              logger.error(
                "failed to update token",
                "userController:login().saveToken()",
                10
              );
              let apiResponse = response.generate(
                true,
                "Failed To Generate Token",
                500,
                null
              );
              reject(apiResponse);
            } else {
              response = {
                authToken: updateToken.authToken,
                userDetails: tokenDetails.userDetails,
              };
              resolve(response);
            }
          });
        }
      });
    });
  };

  findUser(req, res)
    .then(validateUserPassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
      let apiResponse = response.generate(
        false,
        "Login Successful",
        200,
        resolve
      );
      res.status(200);
      res.send(apiResponse);
    })
    .catch((error) => {
      res.status(error.status).send(error);
    });
};

/** Logout Function */

let logout = (req, res) => {
  AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
    if (err) {
      logger.error(err.message, "user Controller: logout", 10);
      let apiResponse = response.generate(
        true,
        `error occurred: ${err.message}`,
        500,
        null
      );
      res.send(apiResponse);
    } else if (check.isEmpty(result)) {
      let apiResponse = response.generate(
        true,
        "Already Logged Out or Invalid UserId",
        404,
        null
      );
      res.send(apiResponse);
    } else {
      let apiResponse = response.generate(
        false,
        "Logged Out Successfully",
        200,
        null
      );
      res.send(apiResponse);
    }
  });
}; // end logout function

/** Get every user in the db */
let getAllUsers = (req, res) => {
  UserModel.find().exec((err, details) => {
    if (err) {
      logger.error(err.message, "userController: getAllUserOnSystem", 10);
      let apiResponse = response.generate(
        true,
        "Failed To find  Users",
        500,
        null
      );
      res.send(apiResponse);
    } else if (check.isEmpty(details)) {
      logger.info("no local user found", "userController: getAllUserOnSystem");
      let apiResponse = response.generate(
        false,
        "no user Found on syatem",
        404,
        details
      );
      res.send(apiResponse);
    } else {
      let apiResponse = response.generate(
        false,
        " user Found on system",
        200,
        details
      );
      res.send(apiResponse);
    }
  });
};

/** Get single  user information */
let getSingleUser = (req, res) => {
  UserModel.findOne({ userId: req.params.userId })
    .select("-password -__v -_id")
    .lean()
    .exec((err, result) => {
      if (err) {
        console.log(err);
        logger.error(err.message, "userController: getSingleUserInfo", 10);
        let apiResponse = response.generate(
          true,
          "Failed to find  user details",
          500,
          null
        );
        res.send(apiResponse);
      } else if (check.isEmpty(result)) {
        logger.info("No user found", "userController: getSingleUserInfo");
        let apiResponse = response.generate(true, "No user found", 404, null);
        res.send(apiResponse);
      } else {
        logger.info(" User Info Found", "userController: getSingleUserInfo");
        let apiResponse = response.generate(
          false,
          " User Details Found",
          200,
          result
        );
        res.send(apiResponse);
      }
    });
};

/** Generate forgot password link */

let forgotPassword = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        UserModel.findOne({ email: req.body.email }).exec((err, result) => {
          if (err) {
            console.log(err);
            logger.error(
              "Failed To Retrieve User Data",
              "userController: findUser()",
              10
            );
            let apiResponse = response.generate(
              true,
              "Failed To Find User Details",
              500,
              null
            );
            reject(apiResponse);
          } else if (check.isEmpty(result)) {
            console.log("no user found");
            logger.error("No user found", "userController: findUser()", 10);
            let apiResponse = response.generate(
              true,
              "Failed To Find User",
              500,
              null
            );
            reject(apiResponse);
          } else {
            logger.info("User Found", "userController: findUser()", 10);
            resolve(result);
          }
        });
      }
    });
  };

  let generateToken = (userDetailsObj) => {
    return new Promise((resolve, reject) => {
      token.generateToken(userDetailsObj, (err, tokenDetails) => {
        if (err) {
          console.log(err);
          let apiResponse = response.generate(
            true,
            "Failed To Generate Token",
            500,
            null
          );
          reject(apiResponse);
        } else {
          tokenDetails.userId = userDetailsObj.userId;
          tokenDetails.userDetails = userDetailsObj;
          resolve(tokenDetails);
          console.log(tokenDetails);
        }
      });
    });
  };

  let saveToken = (tokenDetails) => {
    return new Promise((resolve, reject) => {
      AuthModel.findOne({ userId: tokenDetails.userId }).exec((err, result) => {
        if (err) {
          console.log(err);
          let apiResponse = response.generate(
            true,
            "Failed to generate token",
            500,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(result)) {
          let newAuthModel = new AuthModel({
            userId: tokenDetails.userId,
            authToken: tokenDetails.token,
            tokenSecret: tokenDetails.tokenSecret,
            tokenGenerationTime: time.now(),
          });

          newAuthModel.save((err, result) => {
            if (err) {
              console.log(err);
              let apiResponse = response.generate(
                true,
                "Failed to save token",
                500,
                null
              );
              reject(apiResponse);
            } else {
              let apiResponse = {
                authToken: result.authToken,
                userDetails: tokenDetails.userDetails,
              };
              console.log("apiResponse:" + apiResponse);
              resolve(apiResponse);
            }
          });
          /* if user's AuthModel is already present */
        } else {
          result.authToken = tokenDetails.token;
          result.tokenSecret = tokenDetails.tokenSecret;
          result.tokenGenerationTime = time.now();
          result.save((err, newAuthToken) => {
            if (err) {
              console.log(err);
              let apiResponse = response.generate(
                true,
                "Failed to save token",
                500,
                null
              );
              reject(apiResponse);
            } else {
              let apiResponse = {
                authToken: newAuthToken.authToken,
                userDetails: tokenDetails.userDetails,
              };
              console.log("apiResponse:" + apiResponse);
              resolve(apiResponse);
            }
          });
        }
      });
    });
  };

  let generateLink = (apiResponse) => {
    return new Promise((resolve, reject) => {
      let userId = apiResponse.userDetails.userId;
      let authToken = apiResponse.authToken;
      let response = {
        link: `http://localhost:4200/resetpassword/${userId}?authToken=${authToken}`,
        userEmail: apiResponse.userDetails.email
      }

      console.log(response);
      resolve(response);
    });
  };

  let sendmailLink = (response) => {

    /** nodemailer*/

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'splitexpensepro@gmail.com',
        pass: 'shan2895kar'
      }
    });
    console.log(response.userEmail)
    let mailOptions = {
      from: 'splitexpensepro@gmail.com',
      to: response.userEmail,
      subject: 'Reset password link',
      text: response.link
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
        resolve(result)
      }
    });

    /** nodemailer test end */
  }

  findUser(req, res)
    .then(generateToken)
    .then(saveToken)
    .then(generateLink)
    .then(sendmailLink)
    .then((resolve) => {
      let apiResponse = response.generate(
        false,
        "link generated successfully",
        200,
        resolve
      );
      res.send(apiResponse);
    });
};

/** Reset password */

let resetPassword = (req, res) => {
  let userId = req.body.userId;
  if (userId) {
    console.log("userIds==========> : " + userId);
    UserModel.updateOne(
      { userId: userId },
      {
        $set: {
          password: passwordLib.hashPassword(req.body.password),
        },
      }
    ).exec((err, result) => {
      if (err) {
        logger.error(
          err.message,
          "UserController: Password edited AnExistingUser",
          10
        );
        let apiResponse = response.generate(true, "Failed", 500, null);
        res.send(apiResponse);
      } else if (check.isEmpty(result)) {
        logger.info(
          "No User Found",
          "UserController: Password edited AnExistingUser"
        );
        let apiResponse = response.generate(
          true,
          "No User Found",
          404,
          null
        );
        res.send(apiResponse);
      } else {
        console.log("User details Password edited ed");
        let apiResponse = response.generate(
          false,
          "User details Password edited ed",
          200,
          result
        );
        console.log("apiResponse:" + apiResponse);
        res.send(apiResponse);
      }
    });
  }
};

module.exports = {
  signupFunction: signupFunction,
  loginFunction: loginFunction,
  logout: logout,
  getAllUsers: getAllUsers,
  getSingleUser: getSingleUser,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword
};
