const mongoose = require("mongoose");
const Auth = mongoose.model("Auth");
const logger = require("../libs/loggerLib");
const token = require("../libs/tokenLib");
const check = require("../libs/checkLib");
const response = require('../libs/responseLib')

let isAuthorized = (req, res, next) => {
  if (
    req.params.authToken ||
    req.query.authToken ||
    req.body.authToken ||
    req.header("authToken")
  ) {
    Auth.findOne(
      {
        authToken:
          req.header("authToken") ||
          req.params.authToken ||
          req.body.authToken ||
          req.query.authToken,
      },
      (err, authDetails) => {
        if (err) {
          logger.error(err, "AuthorizationMiddleware", 10);
          let apiResponse = response.generate(
            true,
            "Failed To Authorized",
            500,
            null
          );
          res.send(apiResponse);
        } else if (check.isEmpty(authDetails)) {
          logger.error(
            "No AuthorizationKey Is Present",
            "AuthorizationMiddleware",
            10
          );
          let apiResponse = response.generate(
            true,
            "Invalid Or Expired AuthorizationKey",
            404,
            null
          );
          res.send(apiResponse);
        } else {
          token.verifyClaim(
            authDetails.authToken,
            authDetails.tokenSecret,
            (err, decoded) => {
              if (err) {
                logger.error(err, "Authorization Middleware", 10);
                let apiResponse = response.generate(
                  true,
                  "Failed To Authorized",
                  500,
                  null
                );
                res.send(apiResponse);
              } else {
                req.user = { userId: decoded.data.userId };
                next();
              }
            }
          ); // end verify token
        }
      }
    );
  } else {
    logger.error("AuthorizationToken Missing", "AuthorizationMiddleware", 5);
    let apiResponse = response.generate(
      true,
      "AuthorizationToken Is Missing In Request",
      400,
      null
    );
    res.send(apiResponse);
  }
};

module.exports = {
  isAuthorized: isAuthorized,
};
