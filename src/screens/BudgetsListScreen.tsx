import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { BudgetCard } from '../components/BudgetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { C, R, S } from '../theme';

interface Props {
  onBudgetDetail: (id: string) => void;
  onNewBudget: () => void;
}

const STATUS_FILTERS = [
  { key: 'all',         label: 'Todos'        },
  { key: 'pending',     label: 'Pendentes'    },
  { key: 'quoted',      label: 'Orçados'      },
  { key: 'in_progress', label: 'Em Andamento' },
  { key: 'completed',   label: 'Concluídos'   },
];

export function BudgetsListScreen({ onBudgetDetail, onNewBudget }: Props) {
  const budgets    = useAppStore((s) => s.budgets);
  const setBudgets = useAppStore((s) => s.setBudgets);
  const user       = useAppStore((s) => s.user);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]       = useState('all');

  const loadBudgets = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = user?.role === 'admin'
        ? await budgetService.getAllBudgets()
        : await budgetService.getMyBudgets();
      setBudgets(data);
    } catch { /* keep cached */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBudgets(); }, []);

  const filtered = filter === 'all' ? budgets : budgets.filter((b) => b.status === filter);
  const isAdmin  = user?.role === 'admin';

  if (loading) return <LoadingSpinner message="Carregando orçamentos..." />;

  const total     = budgets.length;
  const pending   = budgets.filter((b) => b.status === 'pending').length;
  const completed = budgets.filter((b) => b.status === 'completed').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 24 }}>
        {/* ambient glow */}
        <View style={{ position: 'absolute', top: 0, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: C.amber, opacity: 0.05 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 13 }}>
              {isAdmin ? 'Administrador' : 'Minha conta'}
            </Text>
            <Text style={{ color: C.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
              {isAdmin ? 'Todos os Pedidos' : 'Meus Orçamentos'}
            </Text>
          </View>
          {!isAdmin && (
            <TouchableOpacity
              onPress={onNewBudget}
              activeOpacity={0.85}
              style={{
                backgroundColor: C.amber, borderRadius: R.md,
                paddingHorizontal: 14, paddingVertical: 9,
                flexDirection: 'row', alignItems: 'center', gap: 6,
                shadowColor: C.amber, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
              }}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Novo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Total',      value: total,     color: C.textPrimary },
            { label: 'Pendentes',  value: pending,   color: C.warning     },
            { label: 'Concluídos', value: completed, color: C.success     },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: C.bgElevated,
              borderRadius: R.md, padding: 12, alignItems: 'center',
              borderWidth: 1, borderColor: C.border,
            }}>
              <Text style={{ color: s.color, fontSize: 22, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: C.textSecondary, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Filter chips ── */}
      <View style={{ backgroundColor: C.bgSurface, paddingVertical: 12, paddingHorizontal: S.md, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
                activeOpacity={0.7}
                style={{
                  marginRight: 8, paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: R.full,
                  backgroundColor: active ? C.amber : C.bgElevated,
                  borderWidth: 1, borderColor: active ? C.amber : C.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.textSecondary }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => (
          <BudgetCard budget={item} onPress={() => onBudgetDetail(item._id)} />
        )}
        contentContainerStyle={{ padding: S.md, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadBudgets(true)}
            tintColor={C.amber}
            colors={[C.amber]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 72 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: C.amberGlow,
              borderWidth: 1.5, borderColor: C.amber + '40',
              alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            }}>
              <Ionicons name="clipboard-outline" size={36} color={C.amber} />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>
              {filter === 'all' ? 'Nenhum orçamento' : 'Nenhum resultado'}
            </Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
              {filter === 'all' ? 'Solicite seu primeiro orçamento agora!' : 'Tente outro filtro.'}
            </Text>
            {filter === 'all' && !isAdmin && (
              <TouchableOpacity onPress={onNewBudget} activeOpacity={0.85}>
                <LinearGradient
                  colors={[C.amberDeep, C.amber]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: R.md, paddingHorizontal: 24, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Solicitar Orçamento</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
