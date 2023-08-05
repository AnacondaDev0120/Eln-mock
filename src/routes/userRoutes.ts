import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/random', async (req, res) => {
  try {
    const response = await axios.get('https://randomuser.me/api/');
    const randomUser = response.data.results[0];
    res.json(randomUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch random user.' });
  }
});

export default router;
