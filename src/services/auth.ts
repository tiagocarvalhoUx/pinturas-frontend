import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await api.post('/auth/register', data);
    await AsyncStorage.setItem('@adelcio:token', res.data.token);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('@adelcio:token', res.data.token);
    return res.data;
  },

  async logout() {
    await AsyncStorage.removeItem('@adelcio:token');
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async updateFcmToken(fcmToken: string) {
    await api.patch('/auth/fcm-token', { fcmToken });
  },
};
