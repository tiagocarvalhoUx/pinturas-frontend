import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { portfolioService } from '../services/portfolio';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SERVICE_LABELS } from '../utils/helpers';
import { PortfolioItem } from '../store/appStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  onDetail: (id: string) => void;
}

const FILTERS = [
  { key: 'Todos', label: 'Todos' },
  { key: 'internal', label: 'Interna' },
  { key: 'external', label: 'Externa' },
  { key: 'texture', label: 'Textura' },
  { key: 'lacquering', label: 'Laqueação' },
  { key: 'waterproofing', label: 'Impermeab.' },
  { key: 'restoration', label: 'Restauração' },
];

const SERVICE_COLORS: Record<string, string> = {
  internal: '#2563EB', external: '#7c3aed', texture: '#d97706',
  lacquering: '#dc2626', waterproofing: '#0891b2', restoration: '#059669',
};

// Sample portfolio items shown when API returns empty
const SAMPLE_ITEMS: PortfolioItem[] = [
  {
    _id: 's1', title: 'Sala de Estar Moderna', serviceType: 'internal', featured: true,
    description: 'Pintura completa com acabamento premium em tons neutros.',
    area: 45, duration: '3 dias', location: 'Araçatuba, SP',
    beforeImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
  },
  {
    _id: 's2', title: 'Fachada Residencial', serviceType: 'external', featured: true,
    description: 'Revitalização completa da fachada com tinta acrílica.',
    area: 120, duration: '5 dias', location: 'Araçatuba, SP',
    beforeImage: { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80' },
  },
  {
    _id: 's3', title: 'Textura Artística', serviceType: 'texture', featured: false,
    description: 'Textura grafiato com efeito moderno na sala de jantar.',
    area: 30, duration: '2 dias', location: 'Birigui, SP',
    afterImage: { url: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80' },
  },
  {
    _id: 's4', title: 'Quarto Casal Premium', serviceType: 'internal', featured: false,
    description: 'Pintura com efeito aveludado e acabamento impecável.',
    area: 25, duration: '2 dias', location: 'Araçatuba, SP',
    afterImage: { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
  },
  {
    _id: 's5', title: 'Laqueação de Móveis', serviceType: 'lacquering', featured: false,
    description: 'Laqueação de cozinha completa em branco brilhante.',
    area: 15, duration: '4 dias', location: 'Penápolis, SP',
    afterImage: { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
  },
  {
    _id: 's6', title: 'Área Externa Gourmet', serviceType: 'external', featured: false,
    description: 'Pintura de área gourmet com proteção especial para externo.',
    area: 60, duration: '3 dias', location: 'Araçatuba, SP',
    afterImage: { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
  },
];

function PortfolioCard({ item, onPress }: { item: PortfolioItem; onPress: () => void }) {
  const [showAfter, setShowAfter] = useState(true);
  const image = showAfter ? item.afterImage : item.beforeImage;
  const color = SERVICE_COLORS[item.serviceType] || '#2563EB';
  const hasBoth = item.beforeImage?.url && item.afterImage?.url;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}
      style={{ width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
      <View style={{ height: 150, backgroundColor: '#f1f5f9' }}>
        {image?.url ? (
          <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={32} color="#cbd5e1" />
          </View>
        )}

        {/* Featured badge */}
        {item.featured && (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fbbf24', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="star" size={10} color="#92400e" />
            <Text style={{ fontSize: 9, fontWeight: '800', color: '#92400e' }}>DESTAQUE</Text>
          </View>
        )}

        {/* Before/After toggle */}
        {hasBoth && (
          <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: 2 }}>
            <TouchableOpacity onPress={() => setShowAfter(false)}
              style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, backgroundColor: !showAfter ? '#fff' : 'transparent' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: !showAfter ? '#000' : '#fff' }}>ANTES</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAfter(true)}
              style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, backgroundColor: showAfter ? '#fff' : 'transparent' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: showAfter ? '#000' : '#fff' }}>DEPOIS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 }} numberOfLines={1}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <View style={{ backgroundColor: color + '18', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color }}>{SERVICE_LABELS[item.serviceType]}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {item.area && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="resize-outline" size={11} color="#94a3b8" />
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{item.area}m²</Text>
            </View>
          )}
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="location-outline" size={11} color="#94a3b8" />
              <Text style={{ fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

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

  // Use real data or sample data if empty
  const allItems = portfolio.length > 0 ? portfolio : SAMPLE_ITEMS;
  const filtered = filter === 'Todos' ? allItems : allItems.filter((i) => i.serviceType === filter);
  const featured = allItems.filter((i) => i.featured);

  if (loading) return <LoadingSpinner message="Carregando portfólio..." />;

  // Split into 2 columns
  const leftCol = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 !== 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />}
      >
        {/* Header */}
        <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 2 }}>Nossos Trabalhos</Text>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 16 }}>Portfólio</Text>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'images-outline', value: allItems.length + '+', label: 'Projetos' },
              { icon: 'star-outline', value: '5.0', label: 'Avaliação' },
              { icon: 'people-outline', value: '200+', label: 'Clientes' },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, alignItems: 'center' }}>
                <Ionicons name={s.icon as any} size={18} color="rgba(255,255,255,0.8)" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, marginTop: 4 }}>{s.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Featured carousel */}
        {featured.length > 0 && (
          <View style={{ paddingTop: 20, paddingBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>Em Destaque</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {featured.map((item) => (
                <TouchableOpacity key={item._id} onPress={() => onDetail(item._id)} activeOpacity={0.9}
                  style={{ width: 220, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
                  <Image
                    source={{ uri: item.afterImage?.url || item.beforeImage?.url }}
                    style={{ width: '100%', height: 130 }} resizeMode="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{item.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter chips */}
        <View style={{ backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginTop: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.7}
                    style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? '#2563EB' : '#f1f5f9' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : '#64748b' }}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Masonry Grid */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, fontWeight: '600' }}>
            {filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </Text>

          {filtered.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              {/* Left column */}
              <View style={{ flex: 1 }}>
                {leftCol.map((item) => (
                  <PortfolioCard key={item._id} item={item} onPress={() => onDetail(item._id)} />
                ))}
              </View>
              {/* Right column */}
              <View style={{ flex: 1 }}>
                {rightCol.map((item) => (
                  <PortfolioCard key={item._id} item={item} onPress={() => onDetail(item._id)} />
                ))}
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="images-outline" size={48} color="#cbd5e1" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 12 }}>Nenhum projeto</Text>
              <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Tente outro filtro</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
