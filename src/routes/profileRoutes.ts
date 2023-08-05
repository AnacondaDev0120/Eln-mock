import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.model';
import sequelize from '../db/database';

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key';

router.get('/profile', async (req, res) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    const jwtToken = token.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(jwtToken, SECRET_KEY) as JwtPayload;
        const email = decoded.email;
        
        const user = await sequelize.models.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.json({ email: user.dataValues.email });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Token is not valid.' });
    }
});

export default router;
