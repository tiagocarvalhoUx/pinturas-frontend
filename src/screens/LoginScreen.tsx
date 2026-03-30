import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

interface Props {
  onLogin: () => void;
  onGoRegister: () => void;
}

export function LoginScreen({ onLogin, onGoRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Atenção', 'Preencha e-mail e senha.');
    try {
      setLoading(true);
      const { user } = await authService.login(email.trim().toLowerCase(), password);
      setUser(user);
      setAuthenticated(true);
      onLogin();
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.response?.data?.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 80, paddingBottom: 48, alignItems: 'center' }}>
          <Image
            source={require('../../assets/logo-pintura.jpeg')}
            style={{ width: 90, height: 90, borderRadius: 22, marginBottom: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' }}
            resizeMode="cover"
          />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Bem-vindo de volta!</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Entre na sua conta</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={{
          backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24,
          padding: 24, marginTop: -28,
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
        }}>
          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>E-mail</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14,
            }}>
              <Ionicons name="mail-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="seu@email.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Senha</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14,
            }}>
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={loading ? ['#93c5fd', '#93c5fd'] : ['#2563EB', '#1d4ed8']}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={onGoRegister}>
              <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 14 }}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ color: '#cbd5e1', fontSize: 12 }}>A. Coraça & T. Carvalho Pinturas e Reformas</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
