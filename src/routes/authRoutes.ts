import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sequelize from '../db/database';
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const existingUser = await sequelize.models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await sequelize.models.User.create({ email, password: hashedPassword });
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await sequelize.models.User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.dataValues.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ email: email }, SECRET_KEY);
  return res.json({ token });
});

export default router;
