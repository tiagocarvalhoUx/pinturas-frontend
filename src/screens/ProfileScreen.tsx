import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import api from '../services/api';
import { C, R, S, F } from '../theme';

interface Props {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: Props) {
  const user    = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const logout  = useAppStore((s) => s.logout);
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving]               = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [edited, setEdited]               = useState(false);
  const [focusedField, setFocusedField]   = useState<string | null>(null);

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const isAdmin  = user?.role === 'admin';

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
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
              { text: 'Cancelar', style: 'cancel',      onPress: () => resolve(false) },
              { text: 'Sair',     style: 'destructive', onPress: () => resolve(true)  },
            ]);
          });
    if (!confirmed) return;
    await authService.logout();
    logout();
    onLogout();
  };

  const inputBorder = (field: string) => focusedField === field ? C.amber : C.border;
  const inputIcon   = (field: string) => focusedField === field ? C.amber : C.textDisabled;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgBase }} showsVerticalScrollIndicator={false}>

      {/* ── Avatar header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 56, paddingBottom: 44, alignItems: 'center' }}>
        <View style={{
          position: 'absolute', top: 20, width: 240, height: 240,
          borderRadius: 120, backgroundColor: C.amber, opacity: 0.04,
        }} />

        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={{ position: 'relative', marginBottom: 16 }}>
          {uploadingAvatar ? (
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.bgElevated, borderWidth: 2, borderColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={C.amber} size="large" />
            </View>
          ) : user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: C.amber }} />
          ) : (
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.amberGlow, borderWidth: 2, borderColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.amber, fontSize: 36, fontWeight: '800', fontFamily: F.base }}>{initials}</Text>
            </View>
          )}
          <View style={{
            position: 'absolute', bottom: 0, right: 0,
            backgroundColor: C.amber, borderRadius: 14,
            width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
            shadowColor: C.amber, shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
          }}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={{ color: C.textPrimary, fontSize: 20, fontWeight: '800', fontFamily: F.base }}>{user?.name}</Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
          backgroundColor: isAdmin ? C.amber + '25' : C.bgElevated,
          borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 5,
          borderWidth: 1, borderColor: isAdmin ? C.amber + '55' : C.border,
        }}>
          <Ionicons name={isAdmin ? 'shield-checkmark' : 'person'} size={12} color={isAdmin ? C.amber : C.textSecondary} />
          <Text style={{ color: isAdmin ? C.amber : C.textSecondary, fontSize: 12, fontWeight: '700', fontFamily: F.base }}>
            {isAdmin ? 'Administrador' : 'Cliente'}
          </Text>
        </View>

        <Text style={{ color: C.textSecondary, fontSize: 13, marginTop: 6, fontFamily: F.base }}>{user?.email}</Text>
      </View>

      <View style={{ padding: S.md, marginTop: -20 }}>

        {/* ── Form Card ── */}
        <View style={{
          backgroundColor: C.bgSurface, borderRadius: R.xl, padding: S.lg, marginBottom: S.md,
          borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 18, letterSpacing: 0.3, fontFamily: F.base }}>
            Informações Pessoais
          </Text>

          {/* Nome */}
          <View style={{ marginBottom: S.md }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
              Nome Completo
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: inputBorder('name'), borderRadius: R.md, paddingHorizontal: 14 }}>
              <Ionicons name="person-outline" size={18} color={inputIcon('name')} />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
                value={name}
                onChangeText={(v) => { setName(v); setEdited(true); }}
                placeholder="Seu nome"
                placeholderTextColor={C.textDisabled}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Email readonly */}
          <View style={{ marginBottom: S.md }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
              E-mail
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgDeep, borderWidth: 1.5, borderColor: C.borderSoft, borderRadius: R.md, paddingHorizontal: 14 }}>
              <Ionicons name="mail-outline" size={18} color={C.textDisabled} />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: C.textDisabled, fontFamily: F.base }}
                value={user?.email}
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={13} color={C.textDisabled} />
            </View>
          </View>

          {/* Telefone */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
              Telefone
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: inputBorder('phone'), borderRadius: R.md, paddingHorizontal: 14 }}>
              <Ionicons name="call-outline" size={18} color={inputIcon('phone')} />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
                value={phone}
                onChangeText={(v) => { setPhone(v); setEdited(true); }}
                placeholder="(11) 99999-9999"
                placeholderTextColor={C.textDisabled}
                keyboardType="phone-pad"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={saveProfile} disabled={saving || !edited} activeOpacity={0.85} style={{ marginBottom: S.md }}>
          <LinearGradient
            colors={edited ? [C.amberDeep, C.amber] : [C.bgElevated, C.bgElevated]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: R.md, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {saving ? (
              <ActivityIndicator color={C.amber} size="small" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color={edited ? '#fff' : C.textDisabled} />
            )}
            <Text style={{ color: edited ? '#fff' : C.textDisabled, fontSize: 15, fontWeight: '700', fontFamily: F.base }}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Account info */}
        <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 14, letterSpacing: 0.3, fontFamily: F.base }}>
            Conta
          </Text>
          {[
            { icon: 'shield-outline',   label: 'Tipo de conta', value: isAdmin ? 'Administrador' : 'Cliente', color: isAdmin ? C.amber : C.textSecondary },
            { icon: 'calendar-outline', label: 'Membro desde',  value: 'Março 2026',                          color: C.textSecondary },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: R.sm, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: C.textDisabled, fontWeight: '600', letterSpacing: 0.5, fontFamily: F.base }}>{item.label}</Text>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '600', marginTop: 1, fontFamily: F.base }}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            backgroundColor: C.bgSurface, borderRadius: R.md, paddingVertical: 15,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            borderWidth: 1.5, borderColor: C.error + '40', marginBottom: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={C.error} />
          <Text style={{ color: C.error, fontSize: 15, fontWeight: '700', fontFamily: F.base }}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: C.textDisabled, fontSize: 11, marginTop: 16, marginBottom: 12, fontFamily: F.base }}>
          A. Coraça & T. Carvalho Pinturas e Reformas v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
