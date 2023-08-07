const { ValidationError } = require('joi');

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  let status = 500;
  let data = {
    message: 'Internal Server Error',
  };

  if (err instanceof ValidationError) { // Fix the typo in 'ValidationError'
    status = 400; // Change the status code to 400 for validation errors
    data.message = err.message;
    return res.status(status).json(data);
  }

  if (err.status) {
    status = err.status;
  }

  if (err.message) {
    data.message = err.message;
  }

  return res.status(status).json(data);
};

module.exports = errorHandler;
