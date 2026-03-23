import axios from 'axios';
import { Platform } from 'react-native';
import {getToken} from '@/utils/storage';

const MOBILE_LOCAL_IP = '192.168.X.X'; 
const PORT = '3000';

export const API_URL = Platform.OS === 'web'
  ? `http://localhost:${PORT}`
  : `http://${MOBILE_LOCAL_IP}:${PORT}`;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(async (config) => {
    const token = await getToken('jwt_token');
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})