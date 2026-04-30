import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { C, R, S, F } from '../theme';
import { LogoHero } from '../components/LogoHero';

interface Props {
  onBack: () => void;
  externalError?: string | null;
  onClearExternalError?: () => void;
}

export function MagicLinkScreen({ onBack, externalError, onClearExternalError }: Props) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [focused, setFocused] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (externalError) setError(externalError);
  }, [externalError]);

  const handleSend = async () => {
    if (loading) return;
    setError('');
    onClearExternalError?.();
    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Digite um e-mail válido.');
      return;
    }
    try {
      setLoading(true);
      await authService.requestMagicLink(value);
      setSent(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        err?.code ||
        'Nao foi possivel enviar o link. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bgBase }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: C.bgDeep, paddingTop: 80, paddingBottom: 52, alignItems: 'center' }}>
          <View style={{
            position: 'absolute', top: 40, width: 200, height: 200,
            borderRadius: 100, backgroundColor: C.amber, opacity: 0.05,
          }} />

          <TouchableOpacity
            onPress={onBack}
            style={{
              position: 'absolute', top: 50, left: S.md, zIndex: 1,
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.border,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>

          <LogoHero size="md" />
          <View style={{ width: 32, height: 2, backgroundColor: C.amber, borderRadius: 1, marginBottom: 14 }} />
          <Text style={{ color: C.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 0.3, fontFamily: F.base }}>
            Entrar com link mágico
          </Text>
          <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 5, fontFamily: F.base, paddingHorizontal: S.lg, textAlign: 'center' }}>
            Sem senha. Receba um link no seu e-mail.
          </Text>
        </View>

        <View style={{
          backgroundColor: C.bgSurface,
          marginHorizontal: S.md, borderRadius: R.xl,
          padding: S.lg, marginTop: -28,
          borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3, shadowRadius: 28, elevation: 12,
        }}>
          {sent ? (
            <View style={{ alignItems: 'center', paddingVertical: S.md }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center',
                marginBottom: S.md,
              }}>
                <Ionicons name="mail-open-outline" size={32} color={C.success} />
              </View>
              <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800', fontFamily: F.base, textAlign: 'center' }}>
                Verifique seu e-mail
              </Text>
              <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 8, fontFamily: F.base, textAlign: 'center', lineHeight: 20 }}>
                Enviamos um link de acesso para{'\n'}
                <Text style={{ color: C.textPrimary, fontWeight: '700' }}>{email.trim().toLowerCase()}</Text>
              </Text>
              <Text style={{ color: C.textDisabled, fontSize: 12, marginTop: 12, fontFamily: F.base, textAlign: 'center' }}>
                O link expira em 15 minutos.
              </Text>

              <TouchableOpacity
                onPress={() => { setSent(false); setEmail(''); }}
                activeOpacity={0.8}
                style={{
                  marginTop: S.lg,
                  borderWidth: 1.5, borderColor: C.amber + '55',
                  borderRadius: R.md, paddingVertical: 14, paddingHorizontal: S.lg,
                }}
              >
                <Text style={{ color: C.amber, fontWeight: '700', fontSize: 14, fontFamily: F.base }}>
                  Usar outro e-mail
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ marginBottom: S.md }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
                  E-mail
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: C.bgElevated,
                  borderWidth: 1.5,
                  borderColor: focused ? C.amber : C.border,
                  borderRadius: R.md,
                  paddingHorizontal: 14,
                }}>
                  <Ionicons name="mail-outline" size={18} color={focused ? C.amber : C.textDisabled} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
                    placeholder="seu@email.com"
                    placeholderTextColor={C.textDisabled}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={handleSend}
                  />
                </View>
              </View>

              {!!error && (
                <View style={{
                  backgroundColor: C.error + '18', borderRadius: R.md,
                  borderWidth: 1, borderColor: C.error + '50',
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
                }}>
                  <Ionicons name="alert-circle-outline" size={18} color={C.error} />
                  <Text style={{ flex: 1, color: C.error, fontSize: 13, fontWeight: '600', fontFamily: F.base }}>{error}</Text>
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPress={handleSend}
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
                    {loading ? (
                      <ActivityIndicator size="small" color={C.textDisabled} />
                    ) : (
                      <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                    )}
                    <Text style={{ color: loading ? C.textDisabled : '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3, fontFamily: F.base }}>
                      {loading ? 'Enviando...' : 'Enviar link de acesso'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Text style={{ color: C.textDisabled, fontSize: 12, marginTop: 14, fontFamily: F.base, textAlign: 'center', lineHeight: 18 }}>
                Não tem cadastro? Crie sua conta automaticamente ao{'\n'}clicar no link enviado.
              </Text>
            </>
          )}
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 36 }}>
          <Text style={{ color: C.textDisabled, fontSize: 11, letterSpacing: 0.3, fontFamily: F.base }}>
            A. Coraça & T. Carvalho Pinturas e Reformas
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

