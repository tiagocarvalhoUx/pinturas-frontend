import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import { C, R, S } from '../theme';

interface Props {
  onRegister: () => void;
  onGoLogin: () => void;
}

type FieldKey = 'name' | 'email' | 'phone' | 'password' | 'confirmPassword';

interface Field {
  label: string;
  key: FieldKey;
  placeholder: string;
  icon: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secure?: boolean;
}

const FIELDS: Field[] = [
  { label: 'Nome completo', key: 'name', placeholder: 'João Silva', icon: 'person-outline' },
  { label: 'E-mail', key: 'email', placeholder: 'joao@email.com', icon: 'mail-outline', keyboardType: 'email-address', autoCapitalize: 'none' },
  { label: 'Telefone', key: 'phone', placeholder: '(11) 99999-9999', icon: 'call-outline', keyboardType: 'phone-pad' },
  { label: 'Senha', key: 'password', placeholder: '••••••••', icon: 'lock-closed-outline', secure: true },
  { label: 'Confirmar senha', key: 'confirmPassword', placeholder: '••••••••', icon: 'lock-closed-outline', secure: true },
];

export function RegisterScreen({ onRegister, onGoLogin }: Props) {
  const [form, setForm]       = useState<Record<FieldKey, string>>({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const setUser          = useAppStore((s) => s.setUser);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  const set = (key: FieldKey) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
    if (form.password !== form.confirmPassword) return Alert.alert('Atenção', 'As senhas não coincidem.');
    if (form.password.length < 6) return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    try {
      setLoading(true);
      const { user } = await authService.register({ name: form.name, email: form.email.toLowerCase(), password: form.password, phone: form.phone });
      setUser(user);
      setAuthenticated(true);
      onRegister();
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Falha ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bgBase }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ backgroundColor: C.bgDeep, paddingTop: 64, paddingBottom: 48, alignItems: 'center' }}>
          <View style={{
            position: 'absolute', top: 30, width: 180, height: 180,
            borderRadius: 90, backgroundColor: C.amber, opacity: 0.05,
          }} />

          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: C.amberGlow, borderWidth: 1.5, borderColor: C.amber + '55',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Ionicons name="person-add" size={32} color={C.amber} />
          </View>
          <View style={{ width: 28, height: 2, backgroundColor: C.amber, borderRadius: 1, marginBottom: 12 }} />
          <Text style={{ color: C.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 }}>
            Criar Conta
          </Text>
          <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 5 }}>Rápido e gratuito</Text>
        </View>

        {/* Form Card */}
        <View style={{
          backgroundColor: C.bgSurface,
          marginHorizontal: S.md, borderRadius: R.xl,
          padding: S.lg, marginTop: -24,
          borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3, shadowRadius: 28, elevation: 12,
        }}>
          {FIELDS.map((field) => {
            const isSecure = field.secure;
            const visible  = showPass[field.key];
            const isFocused = focusedField === field.key;

            return (
              <View key={field.key} style={{ marginBottom: S.md }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  {field.label}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: C.bgElevated,
                  borderWidth: 1.5, borderColor: isFocused ? C.amber : C.border,
                  borderRadius: R.md, paddingHorizontal: 14,
                }}>
                  <Ionicons name={field.icon as any} size={18} color={isFocused ? C.amber : C.textDisabled} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary }}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.textDisabled}
                    value={form[field.key]}
                    onChangeText={set(field.key)}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || 'sentences'}
                    autoCorrect={false}
                    secureTextEntry={isSecure && !visible}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                  {isSecure && (
                    <TouchableOpacity onPress={() => setShowPass((p) => ({ ...p, [field.key]: !p[field.key] }))}>
                      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Submit */}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={loading ? [C.bgMuted, C.bgMuted] : [C.amberDeep, C.amber]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: R.md, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              {!loading && <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
              <Text style={{ color: loading ? C.textDisabled : '#fff', fontSize: 16, fontWeight: '800' }}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: C.textSecondary, fontSize: 14 }}>Já tem conta? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text style={{ color: C.amber, fontWeight: '700', fontSize: 14 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 36 }}>
          <Text style={{ color: C.textDisabled, fontSize: 11 }}>A. Coraça & T. Carvalho Pinturas e Reformas</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
