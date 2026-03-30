import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { BudgetCard } from '../components/BudgetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Props {
  onBudgetDetail: (id: string) => void;
  onNewBudget: () => void;
}

const STATUS_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'quoted', label: 'Orçados' },
  { key: 'in_progress', label: 'Em Andamento' },
  { key: 'completed', label: 'Concluídos' },
];

export function BudgetsListScreen({ onBudgetDetail, onNewBudget }: Props) {
  const budgets = useAppStore((s) => s.budgets);
  const setBudgets = useAppStore((s) => s.setBudgets);
  const user = useAppStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadBudgets = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = user?.role === 'admin'
        ? await budgetService.getAllBudgets()
        : await budgetService.getMyBudgets();
      setBudgets(data);
    } catch {
      // keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBudgets(); }, []);

  const filtered = filter === 'all' ? budgets : budgets.filter((b) => b.status === filter);

  const isAdmin = user?.role === 'admin';

  if (loading) return <LoadingSpinner message="Carregando orçamentos..." />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {isAdmin ? 'Administrador' : 'Minha conta'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
              {isAdmin ? 'Todos os Pedidos' : 'Meus Orçamentos'}
            </Text>
          </View>
          {!isAdmin && (
            <TouchableOpacity
              onPress={onNewBudget}
              activeOpacity={0.85}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Novo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats summary */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{budgets.length}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Total</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fbbf24', fontSize: 20, fontWeight: '800' }}>
              {budgets.filter((b) => b.status === 'pending').length}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Pendentes</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#34d399', fontSize: 20, fontWeight: '800' }}>
              {budgets.filter((b) => b.status === 'completed').length}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Concluídos</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter chips */}
      <View style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
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
                  marginRight: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: active ? '#2563EB' : '#f1f5f9',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : '#64748b' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => (
          <BudgetCard budget={item} onPress={() => onBudgetDetail(item._id)} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadBudgets(true)} tintColor="#2563EB" />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 64 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="clipboard-outline" size={38} color="#93c5fd" />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 6 }}>
              {filter === 'all' ? 'Nenhum orçamento' : 'Nenhum resultado'}
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
              {filter === 'all' ? 'Solicite seu primeiro orçamento agora!' : 'Tente outro filtro.'}
            </Text>
            {filter === 'all' && !isAdmin && (
              <TouchableOpacity onPress={onNewBudget} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#2563EB', '#1d4ed8']}
                  style={{ borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
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
