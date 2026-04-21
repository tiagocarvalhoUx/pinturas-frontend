import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import { C, R, S, F } from '../theme';

interface Props {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: Props) {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    onLogout();
  };

  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgBase }} contentContainerStyle={{ padding: S.md, paddingBottom: 40 }}>

      {/* Header */}
      <View style={{ backgroundColor: C.bgDeep, marginHorizontal: -S.md, marginTop: -S.md, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 28, marginBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Text style={{ color: C.textSecondary, fontSize: 12, letterSpacing: 0.5, fontFamily: F.base, marginBottom: 4 }}>Minha Conta</Text>
        <Text style={{ color: C.textPrimary, fontSize: 24, fontWeight: '900', fontFamily: F.base }}>Perfil</Text>
      </View>

      {/* Avatar + info */}
      <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border, alignItems: 'center', marginBottom: 16 }}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }} />
        ) : (
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.amber + '30', borderWidth: 2, borderColor: C.amber, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: C.amber, fontFamily: F.base }}>{initial}</Text>
          </View>
        )}
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.textPrimary, fontFamily: F.base }}>{user?.name || 'Usuário'}</Text>
        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 4, fontFamily: F.base }}>{user?.email}</Text>
        {user?.role === 'admin' && (
          <View style={{ marginTop: 8, backgroundColor: C.amber + '20', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: C.amber + '40' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: C.amber, fontFamily: F.base }}>ADMIN</Text>
          </View>
        )}
      </View>

      {/* Info rows */}
      {user?.phone && (
        <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="call-outline" size={20} color={C.amber} />
          <View>
            <Text style={{ fontSize: 10, color: C.textDisabled, fontWeight: '600', letterSpacing: 0.5, fontFamily: F.base }}>TELEFONE</Text>
            <Text style={{ fontSize: 15, color: C.textPrimary, fontWeight: '600', fontFamily: F.base }}>{user.phone}</Text>
          </View>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={{
        marginTop: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: R.lg,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
        paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 15, fontFamily: F.base }}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
