import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:5109/api',
});

export default httpClient;