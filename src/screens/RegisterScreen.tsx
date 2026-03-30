import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

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
  const [form, setForm] = useState<Record<FieldKey, string>>({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const setUser = useAppStore((s) => s.setUser);
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
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 60, paddingBottom: 40, alignItems: 'center' }}>
          <View style={{
            width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <Ionicons name="person-add" size={34} color="#fff" />
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Criar Conta</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Rápido e gratuito</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={{
          backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24,
          padding: 24, marginTop: -24,
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
        }}>
          {FIELDS.map((field) => {
            const isSecure = field.secure;
            const visible = showPass[field.key];
            return (
              <View key={field.key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{field.label}</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14,
                }}>
                  <Ionicons name={field.icon as any} size={18} color="#94a3b8" />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                    placeholder={field.placeholder}
                    placeholderTextColor="#94a3b8"
                    value={form[field.key]}
                    onChangeText={set(field.key)}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || 'sentences'}
                    autoCorrect={false}
                    secureTextEntry={isSecure && !visible}
                  />
                  {isSecure && (
                    <TouchableOpacity onPress={() => setShowPass((p) => ({ ...p, [field.key]: !p[field.key] }))}>
                      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Submit */}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={loading ? ['#93c5fd', '#93c5fd'] : ['#2563EB', '#1d4ed8']}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Já tem conta? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 14 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ color: '#cbd5e1', fontSize: 12 }}>A. Coraça & T. Carvalho Pinturas e Reformas</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
