import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Linking, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { PortfolioCard } from '../components/PortfolioCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';
import { portfolioService } from '../services/portfolio';
import { formatCurrency } from '../utils/helpers';

interface Props {
  onBudget: () => void;
  onPortfolio: () => void;
  onServiceDetail: (serviceId: string) => void;
  onPortfolioDetail: (itemId: string) => void;
  onAllServices: () => void;
}

const SERVICE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  internal:      { icon: 'home',           color: '#2563EB', bg: '#eff6ff' },
  external:      { icon: 'business',       color: '#7c3aed', bg: '#f5f3ff' },
  texture:       { icon: 'color-palette',  color: '#d97706', bg: '#fffbeb' },
  lacquering:    { icon: 'sparkles',       color: '#dc2626', bg: '#fef2f2' },
  waterproofing: { icon: 'water',          color: '#0891b2', bg: '#ecfeff' },
  restoration:   { icon: 'construct',      color: '#059669', bg: '#f0fdf4' },
};

const WHATSAPP = '5518998210220';

export function HomeScreen({ onBudget, onPortfolio, onServiceDetail, onPortfolioDetail, onAllServices }: Props) {
  const user = useAppStore((s) => s.user);
  const portfolio = useAppStore((s) => s.portfolio);
  const setPortfolio = useAppStore((s) => s.setPortfolio);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Bem-vindo,</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
              {user?.name?.split(' ')[0]} 👋
            </Text>
          </View>
          <TouchableOpacity style={{ position: 'relative', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 10 }}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1.5, borderColor: '#2563EB' }} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2 }}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#1e293b' }}
            placeholder="Buscar serviços..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -16 }}>
        {/* Quick Services Grid */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(SERVICE_ICONS).slice(0, 4).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                onPress={() => onServiceDetail(key)}
                style={{ width: '21%', alignItems: 'center', gap: 6 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: val.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={val.icon as any} size={24} color={val.color} />
                </View>
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600', textAlign: 'center' }}>
                  {key === 'internal' ? 'Interna' : key === 'external' ? 'Externa' : key === 'texture' ? 'Textura' : 'Laqueação'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <LinearGradient
          colors={['#f59e0b', '#f97316']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, padding: 20, marginBottom: 20, overflow: 'hidden' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17, marginBottom: 4 }}>Solicite seu Orçamento</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 12 }}>Rápido, fácil e sem compromisso</Text>
              <TouchableOpacity onPress={onBudget} activeOpacity={0.85}
                style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 13 }}>Começar</Text>
                <Ionicons name="arrow-forward" size={14} color="#f97316" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 64, opacity: 0.3 }}>🖌️</Text>
          </View>
        </LinearGradient>

        {/* Services */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>Nossos Serviços</Text>
            <TouchableOpacity onPress={onAllServices} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '600' }}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>
          {filtered.slice(0, 3).map((svc) => {
            const meta = SERVICE_ICONS[svc.id] || { icon: 'brush', color: '#2563EB', bg: '#eff6ff' };
            return (
              <TouchableOpacity
                key={svc.id}
                onPress={() => onServiceDetail(svc.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: meta.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>{svc.name}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>A partir de {formatCurrency(svc.pricePerM2)}/m²</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Portfolio Preview */}
        {portfolio.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>Portfólio</Text>
              <TouchableOpacity onPress={onPortfolio} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '600' }}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>
            {portfolio.slice(0, 2).map((item) => (
              <PortfolioCard key={item._id} item={item} onPress={() => onPortfolioDetail(item._id)} />
            ))}
          </View>
        )}

        {/* WhatsApp CTA */}
        <LinearGradient
          colors={['#2563EB', '#1d4ed8']}
          style={{ borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 32 }}
        >
          <Ionicons name="logo-whatsapp" size={36} color="#fff" style={{ marginBottom: 10 }} />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17, marginBottom: 4 }}>Precisa de ajuda?</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            Entre em contato pelo WhatsApp
          </Text>
          <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.85}
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
            <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 14 }}>Chamar no WhatsApp</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const MOCK_SERVICES = [
  { id: 'internal', name: 'Pintura Interna', pricePerM2: 25 },
  { id: 'external', name: 'Pintura Externa', pricePerM2: 35 },
  { id: 'texture', name: 'Textura e Grafiato', pricePerM2: 45 },
  { id: 'lacquering', name: 'Laqueação', pricePerM2: 120 },
  { id: 'waterproofing', name: 'Impermeabilização', pricePerM2: 55 },
  { id: 'restoration', name: 'Restauração', pricePerM2: 40 },
];
