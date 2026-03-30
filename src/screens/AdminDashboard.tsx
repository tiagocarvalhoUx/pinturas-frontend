import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { BudgetCard } from '../components/BudgetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

interface Props {
  onBudgetDetail: (id: string) => void;
  onAllBudgets: () => void;
}

export function AdminDashboard({ onBudgetDetail, onAllBudgets }: Props) {
  const adminStats = useAppStore((s) => s.adminStats);
  const setAdminStats = useAppStore((s) => s.setAdminStats);
  const setBudgets = useAppStore((s) => s.setBudgets);
  const budgets = useAppStore((s) => s.budgets);
  const user = useAppStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/users/admin/stats');
      setAdminStats(res.data.stats);
      setBudgets(res.data.recentBudgets);
    } catch {
      // keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Carregando dashboard..." />;

  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const statCards = [
    { label: 'Total', value: adminStats?.totalBudgets || 0, icon: 'clipboard', color: '#2563EB', bg: '#eff6ff' },
    { label: 'Pendentes', value: adminStats?.pendingBudgets || 0, icon: 'time', color: '#d97706', bg: '#fffbeb' },
    { label: 'Em Andamento', value: adminStats?.inProgressBudgets || 0, icon: 'construct', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Concluídos', value: adminStats?.completedBudgets || 0, icon: 'trophy', color: '#059669', bg: '#f0fdf4' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />}
    >
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{greeting},</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{firstName}! 👋</Text>
          </View>
          <View style={{ backgroundColor: '#fbbf24', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="shield-checkmark" size={14} color="#92400e" />
            <Text style={{ color: '#92400e', fontWeight: '800', fontSize: 12 }}>Admin</Text>
          </View>
        </View>

        {/* Revenue + Rating */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Ionicons name="cash-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Faturamento Total</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
              {formatCurrency(adminStats?.totalRevenue || 0)}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Ionicons name="star-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Avaliação Média</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#fbbf24', fontSize: 22, fontWeight: '800' }}>
                {adminStats?.avgRating?.toFixed(1) || '0.0'}
              </Text>
              <Ionicons name="star" size={16} color="#fbbf24" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={{ padding: 20, marginTop: -16 }}>

        {/* Stat Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {statCards.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: '#fff', borderRadius: 20, padding: 16,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
            }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#0f172a' }}>{s.value}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.label}</Text>
              <View style={{ height: 3, backgroundColor: s.bg, borderRadius: 2, marginTop: 10 }}>
                <View style={{
                  height: 3, borderRadius: 2, backgroundColor: s.color,
                  width: `${Math.min(100, ((s.value as number) / (adminStats?.totalBudgets || 1)) * 100)}%`,
                }} />
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 14 }}>Ações Rápidas</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={onAllBudgets} activeOpacity={0.8} style={{ flex: 1, backgroundColor: '#eff6ff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 }}>
              <Ionicons name="list-outline" size={22} color="#2563EB" />
              <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Ver Orçamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onBudgetDetail(budgets.find(b => b.status === 'pending')?._id || '')} activeOpacity={0.8}
              style={{ flex: 1, backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 }}>
              <Ionicons name="time-outline" size={22} color="#d97706" />
              <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Pendentes ({adminStats?.pendingBudgets || 0})</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Budgets */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>Orçamentos Recentes</Text>
            <TouchableOpacity onPress={onAllBudgets} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#2563EB', fontWeight: '600', fontSize: 13 }}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {budgets.slice(0, 5).map((b) => (
            <BudgetCard key={b._id} budget={b} onPress={() => onBudgetDetail(b._id)} />
          ))}

          {budgets.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 20 }}>
              <Ionicons name="clipboard-outline" size={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 10 }}>Nenhum orçamento ainda</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
