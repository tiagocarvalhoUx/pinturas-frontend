import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { portfolioService } from '../services/portfolio';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SERVICE_LABELS } from '../utils/helpers';
import { PortfolioItem } from '../store/appStore';
import { C, R, S } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  onDetail: (item: PortfolioItem) => void;
}

const FILTERS = [
  { key: 'Todos',         label: 'Todos'        },
  { key: 'internal',      label: 'Interna'      },
  { key: 'external',      label: 'Externa'      },
  { key: 'texture',       label: 'Textura'      },
  { key: 'lacquering',    label: 'Laqueação'    },
  { key: 'waterproofing', label: 'Impermeab.'   },
  { key: 'restoration',   label: 'Restauração'  },
];

const SERVICE_COLORS: Record<string, string> = {
  internal:      C.amber,
  external:      '#5AAAE0',
  texture:       C.terra,
  lacquering:    '#A04ABA',
  waterproofing: '#4ABA79',
  restoration:   C.amberLight,
};

const SAMPLE_ITEMS: PortfolioItem[] = [
  {
    _id: 's1', title: 'Sala de Estar Moderna', serviceType: 'internal', featured: true,
    description: 'Pintura completa com acabamento premium em tons neutros.',
    area: 45, duration: '3 dias', location: 'Araçatuba, SP',
    beforeImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    afterImage:  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
  },
  {
    _id: 's2', title: 'Fachada Residencial', serviceType: 'external', featured: true,
    description: 'Revitalização completa da fachada com tinta acrílica.',
    area: 120, duration: '5 dias', location: 'Araçatuba, SP',
    beforeImage: { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80' },
    afterImage:  { url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80' },
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

// Local card component for the masonry grid
function GridCard({ item, onPress }: { item: PortfolioItem; onPress: () => void }) {
  const [showAfter, setShowAfter] = useState(true);
  const image    = showAfter ? item.afterImage : item.beforeImage;
  const color    = SERVICE_COLORS[item.serviceType] || C.amber;
  const hasBoth  = item.beforeImage?.url && item.afterImage?.url;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}
      style={{
        width: CARD_WIDTH, backgroundColor: C.bgSurface,
        borderRadius: R.lg, overflow: 'hidden', marginBottom: 14,
        borderWidth: 1, borderColor: C.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
      }}
    >
      <View style={{ height: 150, backgroundColor: C.bgElevated }}>
        {image?.url ? (
          <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={32} color={C.textDisabled} />
          </View>
        )}

        {/* Featured badge */}
        {item.featured && (
          <View style={{
            position: 'absolute', top: 8, left: 8,
            backgroundColor: C.amber, borderRadius: R.sm,
            paddingHorizontal: 7, paddingVertical: 3,
            flexDirection: 'row', alignItems: 'center', gap: 3,
          }}>
            <Ionicons name="star" size={9} color="#fff" />
            <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>DESTAQUE</Text>
          </View>
        )}

        {/* Before/After toggle */}
        {hasBoth && (
          <View style={{
            position: 'absolute', top: 8, right: 8,
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: R.sm, padding: 2,
          }}>
            {[false, true].map((after) => (
              <TouchableOpacity
                key={String(after)}
                onPress={() => setShowAfter(after)}
                style={{
                  paddingHorizontal: 6, paddingVertical: 3, borderRadius: R.sm - 1,
                  backgroundColor: showAfter === after ? C.amber : 'transparent',
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>
                  {after ? 'DEPOIS' : 'ANTES'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 5 }} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <View style={{ backgroundColor: color + '20', borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: color + '30' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color }}>{SERVICE_LABELS[item.serviceType]}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {item.area && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="resize-outline" size={11} color={C.textDisabled} />
              <Text style={{ fontSize: 11, color: C.textSecondary }}>{item.area}m²</Text>
            </View>
          )}
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="location-outline" size={11} color={C.textDisabled} />
              <Text style={{ fontSize: 11, color: C.textSecondary }} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function PortfolioScreen({ onDetail }: Props) {
  const portfolio    = useAppStore((s) => s.portfolio);
  const setPortfolio = useAppStore((s) => s.setPortfolio);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('Todos');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await portfolioService.getAll();
      setPortfolio(data);
    } catch { /* keep cached */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const allItems = portfolio.length > 0 ? portfolio : SAMPLE_ITEMS;
  const filtered  = filter === 'Todos' ? allItems : allItems.filter((i) => i.serviceType === filter);
  const featured  = allItems.filter((i) => i.featured);
  const leftCol   = filtered.filter((_, i) => i % 2 === 0);
  const rightCol  = filtered.filter((_, i) => i % 2 !== 0);

  if (loading) return <LoadingSpinner message="Carregando portfólio..." />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>
      <ScrollView
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
        <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 28 }}>
          <View style={{ position: 'absolute', top: 0, right: -10, width: 220, height: 220, borderRadius: 110, backgroundColor: C.amber, opacity: 0.05 }} />
          <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 2 }}>Nossos Trabalhos</Text>
          <Text style={{ color: C.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 }}>Portfólio</Text>
          <View style={{ width: 32, height: 2, backgroundColor: C.amber, borderRadius: 1, marginBottom: 18, opacity: 0.9 }} />

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'images-outline',  value: allItems.length + '+', label: 'Projetos' },
              { icon: 'star-outline',    value: '5.0',                 label: 'Avaliação'},
              { icon: 'people-outline',  value: '200+',                label: 'Clientes' },
            ].map((s) => (
              <View key={s.label} style={{
                flex: 1, backgroundColor: C.bgElevated,
                borderRadius: R.md, padding: 12, alignItems: 'center',
                borderWidth: 1, borderColor: C.border,
              }}>
                <Ionicons name={s.icon as any} size={18} color={C.amber} />
                <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16, marginTop: 4 }}>{s.value}</Text>
                <Text style={{ color: C.textSecondary, fontSize: 11 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Featured horizontal carousel ── */}
        {featured.length > 0 && (
          <View style={{ paddingTop: 20, paddingBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.md, marginBottom: 12 }}>
              <Ionicons name="star" size={16} color={C.amber} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>Em Destaque</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.md, gap: 12 }}>
              {featured.map((item) => (
                <TouchableOpacity key={item._id} onPress={() => onDetail(item)} activeOpacity={0.88}
                  style={{
                    width: 210, backgroundColor: C.bgSurface, borderRadius: R.lg,
                    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18, shadowRadius: 10, elevation: 4,
                  }}
                >
                  <Image
                    source={{ uri: item.afterImage?.url || item.beforeImage?.url }}
                    style={{ width: '100%', height: 130 }} resizeMode="cover"
                  />
                  {/* Amber bottom accent */}
                  <View style={{ height: 2, backgroundColor: C.amber }} />
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{item.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Filter chips ── */}
        <View style={{ backgroundColor: C.bgSurface, paddingVertical: 14, paddingHorizontal: S.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, marginTop: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 7, borderRadius: R.full,
                      backgroundColor: active ? C.amber : C.bgElevated,
                      borderWidth: 1, borderColor: active ? C.amber : C.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.textSecondary }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Masonry grid ── */}
        <View style={{ padding: S.md }}>
          <Text style={{ fontSize: 12, color: C.textDisabled, marginBottom: 14, fontWeight: '600', letterSpacing: 0.5 }}>
            {filtered.length} PROJETO{filtered.length !== 1 ? 'S' : ''}
          </Text>

          {filtered.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flex: 1 }}>
                {leftCol.map((item) => (
                  <GridCard key={item._id} item={item} onPress={() => onDetail(item)} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {rightCol.map((item) => (
                  <GridCard key={item._id} item={item} onPress={() => onDetail(item)} />
                ))}
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: C.amberGlow, borderWidth: 1.5, borderColor: C.amber + '40',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Ionicons name="images-outline" size={36} color={C.amber} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, marginTop: 4 }}>Nenhum projeto</Text>
              <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Tente outro filtro</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
