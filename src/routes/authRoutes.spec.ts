import request from 'supertest';
import sequelize from '../db/database';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
const SECRET_KEY = 'default-secret-key';


jest.mock('../db/database', () => ({
  models: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Register and Login Testing with Mocking', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });


  // Register 
  it('should return status 400 when user nme and password is not set', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: null, password: null });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required.');
  });

  it('should register success when user is not registered', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockResolvedValueOnce(null);
    (sequelize.models.User.create as jest.Mock).mockResolvedValueOnce({
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully.');
  });

  it('should register failed when user is registered', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockReturnValueOnce({
      email: 'test@example.com',
      password: 'password',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists.');
  });

  it('should handle error when an error occurs during registration', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockRejectedValueOnce(new Error('Sample error'));

    const consoleErrorSpy = jest.spyOn(console, 'error');
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('An error occurred.');
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Sample error'));
  });

  //Login
  it('should return status 400 when user nme and password is not set', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: null, password: null });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required.');
  });
  
  it('should login failed when user is not registered', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found.');
  });

  it('should login failed when password is not match', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockResolvedValueOnce({
      dataValues:
      {
        email: 'test@example.com',
        password: 'password',
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials.');
  });

  it('should return token when login is successful', async () => {
    (sequelize.models.User.findOne as jest.Mock).mockResolvedValue({
      dataValues: {
        email: 'token@example.com',
        password: await bcrypt.hash('password', 10),
      },
    });

    const result = await request(app)
      .post('/api/auth/login')
      .send({ email: 'token@example.com', password: 'password' });
      
    const expectedToken = jwt.sign({ email: 'token@example.com' }, SECRET_KEY);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.text).token).toEqual(expectedToken);
  });
});