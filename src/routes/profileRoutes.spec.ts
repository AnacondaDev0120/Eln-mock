import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import profileRoutes from '../routes/profileRoutes';
import sequelize from  '../db/database';
import { SequelizeScopeError } from 'sequelize';


const app = express();
app.use(express.json());
app.use('/api/auth', profileRoutes);
const SECRET_KEY = 'default-secret-key';

jest.mock('../db/database', () => ({
  models: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  },
}));


describe('Profile Route Testing', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return user profile when token is valid', async () => {
    const userMock ={
      dataValues:{
        email: 'test@example.com',
      }
    } ;

    const token = jwt.sign({ email: 'test@example.com' }, SECRET_KEY);

    (sequelize.models.User.findOne as jest.Mock).mockResolvedValue(userMock);

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ email: userMock.dataValues.email });
  });

  it('should return 401 status when token is not provided', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token, authorization denied.' });
  });

  it('should return 404 status when user is not found', async () => {
    const token = jwt.sign({ email: 'test@example.com' }, SECRET_KEY);;

    (sequelize.models.User.findOne as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found.' });
  
  });

  it('should return 500 status when token is not valid', async () => {
    const token = 'sampleInvalidToken';
    (sequelize.models.User.findOne as jest.Mock).mockRejectedValue(
      new SequelizeScopeError('User lookup failed')
    );

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Token is not valid.' });
  });
});