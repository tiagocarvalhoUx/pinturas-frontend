import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Linking, Alert, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { PortfolioCard } from '../components/PortfolioCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';
import { portfolioService } from '../services/portfolio';
import { formatCurrency } from '../utils/helpers';
import { C, R, S, F } from '../theme';

interface Props {
  onBudget: () => void;
  onPortfolio: () => void;
  onServiceDetail: (serviceId: string) => void;
  onPortfolioDetail: (item: any) => void;
  onAllServices: () => void;
}

const SERVICE_ICONS: Record<string, { icon: string; color: string }> = {
  internal:      { icon: 'home',          color: C.amber  },
  external:      { icon: 'business',      color: C.blue   },
  texture:       { icon: 'color-palette', color: C.terra  },
  lacquering:    { icon: 'sparkles',      color: C.purple },
  waterproofing: { icon: 'water',         color: C.green  },
  restoration:   { icon: 'construct',     color: C.amberLight },
};

const WHATSAPP = '5518998210220';

export function HomeScreen({ onBudget, onPortfolio, onServiceDetail, onPortfolioDetail, onAllServices }: Props) {
  const user         = useAppStore((s) => s.user);
  const portfolio    = useAppStore((s) => s.portfolio);
  const setPortfolio = useAppStore((s) => s.setPortfolio);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Grid item width — 4 columns with padding and gaps accounted for
  const screenWidth = Dimensions.get('window').width;
  const gridItemWidth = (screenWidth - S.md * 2 - S.md * 2 - 12 * 3) / 4;

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, featured] = await Promise.all([api.get('/services'), portfolioService.getAll(true)]);
        setServices(svcRes.data.services);
        setPortfolio(featured);
      } catch {
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP}&text=Olá! Gostaria de um orçamento.`)
      .catch(() => Alert.alert('Atenção', 'WhatsApp não encontrado.'));
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner message="Carregando..." />;

  const firstName = user?.name?.split(' ')[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgBase }} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 56, paddingHorizontal: S.md, paddingBottom: 32 }}>
        {/* Ambient glow */}
        <View style={{
          position: 'absolute', top: 0, right: -20, width: 200, height: 200,
          borderRadius: 100, backgroundColor: C.amber, opacity: 0.05,
        }} />

        {/* Greeting row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 13, letterSpacing: 0.3, fontFamily: F.base }}>Olá,</Text>
            <Text style={{ color: C.textPrimary, fontSize: 21, fontWeight: '800', marginTop: 2, fontFamily: F.base }}>
              {firstName} 👋
            </Text>
          </View>
          <TouchableOpacity style={{
            backgroundColor: C.bgElevated, borderRadius: R.md,
            padding: 10, borderWidth: 1, borderColor: C.border,
            position: 'relative',
          }}>
            <Ionicons name="notifications-outline" size={22} color={C.textSecondary} />
            <View style={{
              position: 'absolute', top: 9, right: 9, width: 7, height: 7,
              backgroundColor: C.amber, borderRadius: 4, borderWidth: 1.5, borderColor: C.bgDeep,
            }} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: C.bgElevated,
          borderWidth: 1.5, borderColor: searchFocused ? C.amber : C.border,
          borderRadius: R.md, paddingHorizontal: 14,
        }}>
          <Ionicons name="search-outline" size={18} color={searchFocused ? C.amber : C.textDisabled} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, fontFamily: F.base }}
            placeholder="Buscar serviços..."
            placeholderTextColor={C.textDisabled}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: S.md, marginTop: -1 }}>

        {/* ── Quick icons grid ── */}
        <View style={{
          backgroundColor: C.bgSurface,
          borderRadius: R.lg, padding: S.md, marginBottom: S.md,
          borderWidth: 1, borderColor: C.border,
          marginTop: -16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
        }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(SERVICE_ICONS).slice(0, 4).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                onPress={() => onServiceDetail(key)}
                style={{ width: gridItemWidth, alignItems: 'center', gap: 6 }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 52, height: 52, borderRadius: R.md,
                  backgroundColor: val.color + '1A',
                  borderWidth: 1, borderColor: val.color + '30',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={val.icon as any} size={24} color={val.color} />
                </View>
                <Text style={{ fontSize: 10, color: C.textSecondary, fontWeight: '600', textAlign: 'center', fontFamily: F.base }}>
                  {key === 'internal' ? 'Interna' : key === 'external' ? 'Externa' : key === 'texture' ? 'Textura' : 'Laqueação'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── CTA Banner ── */}
        <TouchableOpacity onPress={onBudget} activeOpacity={0.88} style={{ marginBottom: S.md }}>
          <LinearGradient
            colors={[C.amberDeep, C.amber]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: R.lg, padding: S.lg, overflow: 'hidden' }}
          >
            {/* Decorative circles */}
            <View style={{
              position: 'absolute', right: -20, top: -20,
              width: 110, height: 110, borderRadius: 55,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }} />
            <View style={{
              position: 'absolute', right: 30, bottom: -30,
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }} />

            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontFamily: F.base }}>
              Solicite agora
            </Text>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20, marginBottom: 4, letterSpacing: -0.3, fontFamily: F.base }}>
              Orçamento Gratuito
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 14, fontFamily: F.base }}>
              Rápido, fácil e sem compromisso
            </Text>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: R.sm,
              paddingHorizontal: 14, paddingVertical: 8,
              alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
            }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: F.base }}>Começar</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Services list ── */}
        <View style={{ marginBottom: S.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.2, fontFamily: F.base }}>
              Nossos Serviços
            </Text>
            <TouchableOpacity onPress={onAllServices} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ color: C.amber, fontSize: 13, fontWeight: '700', fontFamily: F.base }}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color={C.amber} />
            </TouchableOpacity>
          </View>

          {filtered.slice(0, 3).map((svc) => {
            const meta = SERVICE_ICONS[svc.id] || { icon: 'brush', color: C.amber };
            return (
              <TouchableOpacity
                key={svc.id}
                onPress={() => onServiceDetail(svc.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: C.bgSurface,
                  borderRadius: R.md, padding: 14, marginBottom: 10,
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  borderWidth: 1, borderColor: C.border,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
                }}
              >
                <View style={{
                  width: 48, height: 48, borderRadius: R.md,
                  backgroundColor: meta.color + '1A',
                  borderWidth: 1, borderColor: meta.color + '30',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: F.base }}>{svc.name}</Text>
                  <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, fontFamily: F.base }}>
                    A partir de {formatCurrency(svc.pricePerM2)}/m²
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textDisabled} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Portfolio preview ── */}
        {portfolio.length > 0 && (
          <View style={{ marginBottom: S.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.2, fontFamily: F.base }}>
                Portfólio
              </Text>
              <TouchableOpacity onPress={onPortfolio} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ color: C.amber, fontSize: 13, fontWeight: '700', fontFamily: F.base }}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={14} color={C.amber} />
              </TouchableOpacity>
            </View>
            {portfolio.slice(0, 2).map((item) => (
              <PortfolioCard key={item._id} item={item} onPress={() => onPortfolioDetail(item)} />
            ))}
          </View>
        )}

        {/* ── WhatsApp CTA ── */}
        <View style={{
          backgroundColor: C.bgSurface,
          borderRadius: R.lg, padding: S.lg,
          alignItems: 'center', marginBottom: 36,
          borderWidth: 1, borderColor: C.border,
        }}>
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: C.whatsappBg,
            borderWidth: 1.5, borderColor: C.whatsapp + '40',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Ionicons name="logo-whatsapp" size={30} color={C.whatsapp} />
          </View>
          <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 17, marginBottom: 4, fontFamily: F.base }}>
            Precisa de ajuda?
          </Text>
          <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 18, textAlign: 'center', fontFamily: F.base }}>
            Entre em contato direto pelo WhatsApp
          </Text>
          <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.85}>
            <LinearGradient
              colors={['#1AAD4C', C.whatsapp]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                borderRadius: R.md, paddingHorizontal: 24, paddingVertical: 13,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, fontFamily: F.base }}>Chamar no WhatsApp</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const MOCK_SERVICES = [
  { id: 'internal',      name: 'Pintura Interna',        pricePerM2: 25 },
  { id: 'external',      name: 'Pintura Externa',        pricePerM2: 35 },
  { id: 'texture',       name: 'Textura e Grafiato',     pricePerM2: 45 },
  { id: 'lacquering',    name: 'Laqueação',              pricePerM2: 120 },
  { id: 'waterproofing', name: 'Impermeabilização',      pricePerM2: 55 },
  { id: 'restoration',   name: 'Restauração',            pricePerM2: 40 },
];
