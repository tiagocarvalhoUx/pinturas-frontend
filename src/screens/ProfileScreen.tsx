import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import api from '../services/api';

interface Props {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: Props) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [edited, setEdited] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const isAdmin = user?.role === 'admin';

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUploadingAvatar(true);
      try {
        const fd = new FormData();
        if (typeof window !== 'undefined') {
          const response = await fetch(uri);
          const blob = await response.blob();
          fd.append('avatar', blob, 'avatar.jpg');
        } else {
          fd.append('avatar', { uri, name: 'avatar.jpg', type: 'image/jpeg' } as any);
        }
        const res = await api.patch('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setUser(res.data.user);
        Alert.alert('Sucesso', 'Foto atualizada!');
      } catch {
        Alert.alert('Erro', 'Falha ao atualizar foto.');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'O nome não pode estar vazio.');
    try {
      setSaving(true);
      const res = await api.patch('/users/profile', { name: name.trim(), phone: phone.trim() });
      setUser(res.data.user);
      setEdited(false);
      Alert.alert('Sucesso!', 'Perfil atualizado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Falha ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm('Deseja realmente sair da conta?')
        : await new Promise<boolean>((resolve) => {
            Alert.alert('Sair da Conta', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Sair', style: 'destructive', onPress: () => resolve(true) },
            ]);
          });

    if (!confirmed) return;
    await authService.logout();
    logout();
    onLogout();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} showsVerticalScrollIndicator={false}>

      {/* Header com avatar */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 56, paddingBottom: 40, alignItems: 'center' }}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={{ position: 'relative', marginBottom: 14 }}>
          {uploadingAvatar ? (
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff' }} />
          ) : (
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
              <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{initials}</Text>
            </View>
          )}
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }}>
            <Ionicons name="camera" size={14} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{user?.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <View style={{ backgroundColor: isAdmin ? '#fbbf24' : 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={isAdmin ? 'shield-checkmark' : 'person'} size={12} color={isAdmin ? '#92400e' : '#fff'} />
            <Text style={{ color: isAdmin ? '#92400e' : '#fff', fontSize: 12, fontWeight: '700' }}>
              {isAdmin ? 'Administrador' : 'Cliente'}
            </Text>
          </View>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{user?.email}</Text>
      </LinearGradient>

      <View style={{ padding: 20, marginTop: -20 }}>

        {/* Form Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 18 }}>Informações Pessoais</Text>

          {/* Nome */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>NOME COMPLETO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: edited && name !== user?.name ? '#2563EB' : '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
              <Ionicons name="person-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                value={name}
                onChangeText={(v) => { setName(v); setEdited(true); }}
                placeholder="Seu nome"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Email (readonly) */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>E-MAIL</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
              <Ionicons name="mail-outline" size={18} color="#cbd5e1" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#94a3b8' }}
                value={user?.email}
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={14} color="#cbd5e1" />
            </View>
          </View>

          {/* Telefone */}
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>TELEFONE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: edited && phone !== user?.phone ? '#2563EB' : '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
              <Ionicons name="call-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                value={phone}
                onChangeText={(v) => { setPhone(v); setEdited(true); }}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={saveProfile} disabled={saving || !edited} activeOpacity={0.85} style={{ marginBottom: 12 }}>
          <LinearGradient
            colors={edited ? ['#2563EB', '#1d4ed8'] : ['#e2e8f0', '#e2e8f0']}
            style={{ borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color={edited ? '#fff' : '#94a3b8'} />
            )}
            <Text style={{ color: edited ? '#fff' : '#94a3b8', fontSize: 15, fontWeight: '700' }}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info cards */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 14 }}>Conta</Text>

          {[
            { icon: 'shield-outline', label: 'Tipo de conta', value: isAdmin ? 'Administrador' : 'Cliente', color: isAdmin ? '#d97706' : '#2563EB' },
            { icon: 'calendar-outline', label: 'Membro desde', value: 'Março 2026', color: '#64748b' },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ fontSize: 14, color: '#1e293b', fontWeight: '600', marginTop: 1 }}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}
          style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#fecaca', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '700' }}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 11, marginTop: 16, marginBottom: 8 }}>
          A. Coraça & T. Carvalho Pinturas e Reformas v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
