import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { BudgetCard } from '../components/BudgetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { C, R, S } from '../theme';

interface Props {
  onBudgetDetail: (id: string) => void;
  onAllBudgets: () => void;
}

export function AdminDashboard({ onBudgetDetail, onAllBudgets }: Props) {
  const adminStats    = useAppStore((s) => s.adminStats);
  const setAdminStats = useAppStore((s) => s.setAdminStats);
  const setBudgets    = useAppStore((s) => s.setBudgets);
  const budgets       = useAppStore((s) => s.budgets);
  const user          = useAppStore((s) => s.user);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/users/admin/stats');
      setAdminStats(res.data.stats);
      setBudgets(res.data.recentBudgets);
    } catch { /* keep cached */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Carregando dashboard..." />;

  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const statCards = [
    { label: 'Total',        value: adminStats?.totalBudgets     || 0, icon: 'clipboard',  color: C.amber  },
    { label: 'Pendentes',    value: adminStats?.pendingBudgets   || 0, icon: 'time',       color: C.warning },
    { label: 'Em Andamento', value: adminStats?.inProgressBudgets|| 0, icon: 'construct',  color: C.info   },
    { label: 'Concluídos',   value: adminStats?.completedBudgets || 0, icon: 'trophy',     color: C.success },
  ];

  const total = adminStats?.totalBudgets || 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bgBase }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={C.amber}
          colors={[C.amber]}
        />
      }
    >
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 32 }}>
        <View style={{ position: 'absolute', top: 0, right: -10, width: 220, height: 220, borderRadius: 110, backgroundColor: C.amber, opacity: 0.05 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 13 }}>{greeting},</Text>
            <Text style={{ color: C.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{firstName}! 👋</Text>
          </View>
          <View style={{
            backgroundColor: C.amber + '25',
            borderRadius: R.md, paddingHorizontal: 12, paddingVertical: 7,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            borderWidth: 1, borderColor: C.amber + '55',
          }}>
            <Ionicons name="shield-checkmark" size={14} color={C.amber} />
            <Text style={{ color: C.amber, fontWeight: '800', fontSize: 12 }}>Admin</Text>
          </View>
        </View>

        {/* Revenue + Rating */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            {
              icon: 'cash-outline', label: 'Faturamento Total',
              value: formatCurrency(adminStats?.totalRevenue || 0),
              valueColor: C.textPrimary,
            },
            {
              icon: 'star-outline', label: 'Avaliação Média',
              value: adminStats?.avgRating?.toFixed(1) || '0.0',
              valueColor: C.amber,
              suffix: <Ionicons name="star" size={14} color={C.amber} />,
            },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: C.bgElevated,
              borderRadius: R.lg, padding: 16,
              borderWidth: 1, borderColor: C.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name={s.icon as any} size={14} color={C.textSecondary} />
                <Text style={{ color: C.textSecondary, fontSize: 12 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: s.valueColor, fontSize: 20, fontWeight: '800' }}>{s.value}</Text>
                {s.suffix}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: S.md, marginTop: -16 }}>

        {/* ── Stat Cards Grid ── */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {statCards.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: C.bgSurface,
              borderRadius: R.lg, padding: S.md,
              borderWidth: 1, borderColor: C.border,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
            }}>
              {/* Icon */}
              <View style={{
                width: 44, height: 44, borderRadius: R.md,
                backgroundColor: s.color + '1A',
                borderWidth: 1, borderColor: s.color + '30',
                alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={{ fontSize: 30, fontWeight: '800', color: C.textPrimary }}>{s.value}</Text>
              <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{s.label}</Text>
              {/* Progress bar */}
              <View style={{ height: 3, backgroundColor: C.bgElevated, borderRadius: 2, marginTop: 12 }}>
                <View style={{
                  height: 3, borderRadius: 2, backgroundColor: s.color,
                  width: `${Math.min(100, ((s.value as number) / total) * 100)}%`,
                }} />
              </View>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={{
          backgroundColor: C.bgSurface, borderRadius: R.lg,
          padding: S.md, marginBottom: 24,
          borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 14 }}>Ações Rápidas</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={onAllBudgets} activeOpacity={0.8}
              style={{ flex: 1, backgroundColor: C.amberGlow, borderRadius: R.md, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.amber + '35' }}>
              <Ionicons name="list-outline" size={22} color={C.amber} />
              <Text style={{ color: C.amber, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Ver Orçamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { const p = budgets.find(b => b.status === 'pending'); if (p) onBudgetDetail(p._id); }}
              activeOpacity={0.8}
              style={{ flex: 1, backgroundColor: C.warning + '18', borderRadius: R.md, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.warning + '35' }}
            >
              <Ionicons name="time-outline" size={22} color={C.warning} />
              <Text style={{ color: C.warning, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                Pendentes ({adminStats?.pendingBudgets || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Budgets ── */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>Orçamentos Recentes</Text>
            <TouchableOpacity onPress={onAllBudgets} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: C.amber, fontWeight: '700', fontSize: 13 }}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color={C.amber} />
            </TouchableOpacity>
          </View>

          {budgets.slice(0, 5).map((b) => (
            <BudgetCard key={b._id} budget={b} onPress={() => onBudgetDetail(b._id)} />
          ))}

          {budgets.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 48, backgroundColor: C.bgSurface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name="clipboard-outline" size={40} color={C.textDisabled} />
              <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 10 }}>Nenhum orçamento ainda</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
