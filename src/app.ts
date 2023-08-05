import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import userRoutes from './routes/userRoutes';
import requestLoggerMiddleware from './middlewares/requestLogger';
import errorHandlerMiddleware from './middlewares/errorHandler';
import sequelize from './db/database';
import 'reflect-metadata'
const app = express();


// Middleware
app.use(bodyParser.json());
app.use(requestLoggerMiddleware);

// Initialize database connection
(async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;