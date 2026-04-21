import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';

const MOBILE_LOCAL_IP = '192.168.X.X';
const PORT = '3000';

export const API_URL =
  Platform.OS === 'web' ? `http://localhost:${PORT}` : `http://${MOBILE_LOCAL_IP}:${PORT}`;

export const apiClient = axios.create({
  baseURL: API_URL
});

apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
