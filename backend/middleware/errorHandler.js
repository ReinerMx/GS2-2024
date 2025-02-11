/**
 * Express error-handling middleware.
 *
 * This middleware catches errors that occur during request processing,
 * logs the error stack to the console, and sends a JSON response with a
 * 500 status code and an error message.
 *
 * @function errorHandler
 * @param {Error} err - The error object that was thrown.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the stack.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  };
  
  module.exports = errorHandler;
  