import axios from 'axios';

const fetchRandomUser = async () => {
  try {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0];
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch random user.');
  }
};

export { fetchRandomUser };
