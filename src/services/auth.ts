import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import api from './api';
import { firebaseAuth } from './firebase';

const APP_TOKEN_KEY = '@adelcio:token';
const MAGIC_LINK_EMAIL_KEY = '@adelcio:magic-link-email';

function getMagicLinkUrl() {
  const base =
    process.env.EXPO_PUBLIC_MAGIC_LINK_URL ||
    process.env.EXPO_PUBLIC_SITE_URL ||
    'http://localhost:8081';

  return base.endsWith('/magic-link') ? base : `${base.replace(/\/$/, '')}/magic-link`;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await api.post('/auth/register', data);
    await AsyncStorage.setItem(APP_TOKEN_KEY, res.data.token);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem(APP_TOKEN_KEY, res.data.token);
    return res.data;
  },

  async logout() {
    await AsyncStorage.multiRemove([APP_TOKEN_KEY, MAGIC_LINK_EMAIL_KEY]);
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async updateFcmToken(fcmToken: string) {
    await api.patch('/auth/fcm-token', { fcmToken });
  },

  async requestMagicLink(email: string) {
    await sendSignInLinkToEmail(firebaseAuth, email, {
      url: getMagicLinkUrl(),
      handleCodeInApp: true,
    });
    await AsyncStorage.setItem(MAGIC_LINK_EMAIL_KEY, email);
    return {
      message: 'Se o e-mail estiver valido, enviaremos um link de acesso em instantes.',
    };
  },

  canHandleMagicLink(url: string | null) {
    return !!url && isSignInWithEmailLink(firebaseAuth, url);
  },

  async verifyMagicLink(url: string) {
    const email = (await AsyncStorage.getItem(MAGIC_LINK_EMAIL_KEY))?.trim().toLowerCase();
    if (!email) {
      throw new Error('Abra o link no mesmo navegador onde o acesso foi solicitado.');
    }

    const credential = await signInWithEmailLink(firebaseAuth, email, url);
    const idToken = await credential.user.getIdToken();
    const res = await api.post('/auth/firebase/verify', { idToken });
    await AsyncStorage.setItem(APP_TOKEN_KEY, res.data.token);
    await AsyncStorage.removeItem(MAGIC_LINK_EMAIL_KEY);
    return res.data;
  },
};
