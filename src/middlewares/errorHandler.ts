import express from 'express';

const errorHandlerMiddleware: express.ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
};

export default errorHandlerMiddleware;
