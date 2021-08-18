const response = require('../libs/responseLib')

let errorHandler = (err, req, res, next) => {
  console.log("application error handler called");
  console.log(err);

  let apiResponse = response.generate(
    true,
    "some error occured at global level(appErrorHandler)",
    500,
    null
  );
  res.send(apiResponse);
}; // end global errorHandler

let notFoundErrorHandler = (req,res,next) => {
    console.log("global not found error handler called");
    let apiResponse = response.generate(true, 'Route not found in application', 404, null)
    res.send(apiResponse)
} // end not found error handler

module.exports = {
    globalErrorHandler : errorHandler,
    globalNotFoundErrorHandler: notFoundErrorHandler
}