import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppStore } from '../store/appStore';
import { portfolioService } from '../services/portfolio';
import { PortfolioCard } from '../components/PortfolioCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SERVICE_LABELS } from '../utils/helpers';

interface Props {
  onDetail: (id: string) => void;
}

const FILTERS = ['Todos', 'internal', 'external', 'texture', 'lacquering', 'waterproofing', 'restoration'];

export function PortfolioScreen({ onDetail }: Props) {
  const portfolio = useAppStore((s) => s.portfolio);
  const setPortfolio = useAppStore((s) => s.setPortfolio);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Todos');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await portfolioService.getAll();
      setPortfolio(data);
    } catch {
      // keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'Todos' ? portfolio : portfolio.filter((i) => i.serviceType === filter);

  if (loading) return <LoadingSpinner message="Carregando portfólio..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-800 mb-3">Portfólio</Text>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              className="mr-2 px-3 py-1.5 rounded-full border"
              style={{
                borderColor: filter === item ? '#2563EB' : '#e5e7eb',
                backgroundColor: filter === item ? '#2563EB' : 'transparent',
              }}
            >
              <Text style={{ color: filter === item ? '#fff' : '#6b7280', fontSize: 12, fontWeight: '600' }}>
                {item === 'Todos' ? 'Todos' : SERVICE_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View className="px-4">
            <PortfolioCard item={item} onPress={() => onDetail(item._id)} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-5xl mb-4">🖼️</Text>
            <Text className="text-lg font-bold text-gray-700">Nenhum projeto encontrado</Text>
          </View>
        }
      />
    </View>
  );
}
