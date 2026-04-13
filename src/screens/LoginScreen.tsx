import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import { C, R, S, F } from '../theme';

interface Props {
  onLogin: () => void;
  onGoRegister: () => void;
}

export function LoginScreen({ onLogin, onGoRegister }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const setUser           = useAppStore((s) => s.setUser);
  const setAuthenticated  = useAppStore((s) => s.setAuthenticated);
  const btnScale = useRef(new Animated.Value(1)).current;

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

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const inputStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: C.bgElevated,
    borderWidth: 1.5,
    borderColor: focusedField === field ? C.amber : C.border,
    borderRadius: R.md,
    paddingHorizontal: 14,
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bgBase }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top brand area */}
        <View style={{ backgroundColor: C.bgDeep, paddingTop: 80, paddingBottom: 52, alignItems: 'center' }}>
          <View style={{
            position: 'absolute', top: 40, width: 200, height: 200,
            borderRadius: 100, backgroundColor: C.amber, opacity: 0.05,
          }} />

          {/* Logo */}
          <View style={{
            width: 92, height: 92, borderRadius: 26,
            borderWidth: 2, borderColor: C.amber,
            overflow: 'hidden', marginBottom: 18,
            shadowColor: C.amber, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 14, elevation: 10,
          }}>
            <Image
              source={require('../../assets/logo-pintura.jpeg')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          <View style={{ width: 32, height: 2, backgroundColor: C.amber, borderRadius: 1, marginBottom: 14 }} />
          <Text style={{ color: C.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 0.3, fontFamily: F.base }}>
            Bem-vindo de volta
          </Text>
          <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 5, fontFamily: F.base }}>
            Entre na sua conta
          </Text>
        </View>

        {/* Form Card */}
        <View style={{
          backgroundColor: C.bgSurface,
          marginHorizontal: S.md, borderRadius: R.xl,
          padding: S.lg, marginTop: -28,
          borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3, shadowRadius: 28, elevation: 12,
        }}>

          {/* Email */}
          <View style={{ marginBottom: S.md }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
              E-mail
            </Text>
            <View style={inputStyle('email')}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? C.amber : C.textDisabled} />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
                placeholder="seu@email.com"
                placeholderTextColor={C.textDisabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: S.lg }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
              Senha
            </Text>
            <View style={inputStyle('password')}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? C.amber : C.textDisabled} />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
                placeholder="••••••••"
                placeholderTextColor={C.textDisabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleLogin}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={loading ? [C.bgMuted, C.bgMuted] : [C.amberDeep, C.amber]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: R.md, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              >
                {!loading && <Ionicons name="log-in-outline" size={20} color="#fff" />}
                <Text style={{ color: loading ? C.textDisabled : '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3, fontFamily: F.base }}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <Text style={{ color: C.textDisabled, fontSize: 12, fontFamily: F.base }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          </View>

          {/* Register link */}
          <TouchableOpacity
            onPress={onGoRegister}
            activeOpacity={0.8}
            style={{
              borderWidth: 1.5, borderColor: C.amber + '55',
              borderRadius: R.md, paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: C.amber, fontWeight: '700', fontSize: 15, fontFamily: F.base }}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 36 }}>
          <Text style={{ color: C.textDisabled, fontSize: 11, letterSpacing: 0.3, fontFamily: F.base }}>
            A. Coraça & T. Carvalho Pinturas e Reformas
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
