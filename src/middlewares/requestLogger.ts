import express from 'express';

const requestLoggerMiddleware: express.RequestHandler = (req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url}`);
  next();
};

export default requestLoggerMiddleware;
