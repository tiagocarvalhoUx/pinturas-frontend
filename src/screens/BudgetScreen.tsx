import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { SERVICE_LABELS } from '../utils/helpers';
import { C, R, S, F } from '../theme';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
  initialServiceType?: string;
}

const SERVICE_TYPES = ['internal', 'external', 'texture', 'lacquering', 'waterproofing', 'restoration'];
const PRICE_MAP: Record<string, number> = { internal: 25, external: 35, texture: 45, lacquering: 120, waterproofing: 55, restoration: 40 };
const SERVICE_ICONS: Record<string, string> = {
  internal: 'home', external: 'business', texture: 'color-palette',
  lacquering: 'sparkles', waterproofing: 'water', restoration: 'construct',
};
const SERVICE_COLORS: Record<string, string> = {
  internal:      C.amber,
  external:      C.blue,
  texture:       C.terra,
  lacquering:    C.purple,
  waterproofing: C.green,
  restoration:   C.amberLight,
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: C.bgSurface, borderRadius: R.lg,
      padding: S.md, marginBottom: S.md,
      borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 14, letterSpacing: 0.2, fontFamily: F.base }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function DarkInput({
  icon, placeholder, value, onChangeText, keyboardType, multiline, right, style,
}: {
  icon: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; keyboardType?: any;
  multiline?: boolean; right?: React.ReactNode; style?: any;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{
      flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: C.bgElevated,
      borderWidth: 1.5, borderColor: focused ? C.amber : C.border,
      borderRadius: R.md, paddingHorizontal: 14,
      paddingTop: multiline ? 12 : 0,
    }, style]}>
      <Ionicons name={icon as any} size={18} color={focused ? C.amber : C.textDisabled} style={multiline ? { marginTop: 2 } : undefined} />
      <TextInput
        style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, textAlignVertical: multiline ? 'top' : 'auto', minHeight: multiline ? 90 : undefined, fontFamily: F.base }}
        placeholder={placeholder}
        placeholderTextColor={C.textDisabled}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {right}
    </View>
  );
}

export function BudgetScreen({ onSuccess, onBack, initialServiceType }: Props) {
  const addBudget = useAppStore((s) => s.addBudget);
  const [serviceType, setServiceType] = useState(initialServiceType || 'internal');
  const [description, setDescription] = useState('');
  const [area, setArea]               = useState('');
  const [phone, setPhone]             = useState('');
  const [street, setStreet]           = useState('');
  const [city, setCity]               = useState('');
  const [state, setState]             = useState('');
  const [photos, setPhotos]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const successScale   = useState(new Animated.Value(0.7))[0];
  const successOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (submitted) {
      Animated.parallel([
        Animated.spring(successScale,   { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => onSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const estimate = area ? Number(area) * (PRICE_MAP[serviceType] || 30) : 0;

  const pickImage = async () => {
    if (photos.length >= 5) { setError('Máximo de 5 fotos permitidas.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsMultipleSelection: true,
    });
    if (!result.canceled) setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { setError('Permita acesso à câmera nas configurações.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    if (!description.trim()) { setError('Preencha a descrição do ambiente.'); return; }
    if (!area)               { setError('Informe a área em m².'); return; }
    if (!phone.trim())       { setError('Informe seu celular para contato.'); return; }
    if (!street.trim() || !city.trim() || !state.trim()) { setError('Preencha o endereço completo.'); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('serviceType', serviceType);
      fd.append('description', description.trim());
      fd.append('area', area);
      fd.append('phone', phone.trim());
      fd.append('address', JSON.stringify({ street: street.trim(), city: city.trim(), state: state.trim() }));
      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i];
        if (uri.startsWith('data:') || uri.startsWith('blob:') || typeof window !== 'undefined') {
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            fd.append('photos', blob, `photo_${i}.jpg`);
          } catch {
            fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
          }
        } else {
          fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
        }
      }
      const budget = await budgetService.create(fd);
      addBudget(budget);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Tempo esgotado. Tente novamente.' : err.message || 'Falha ao enviar orçamento.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgBase, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: successScale }], opacity: successOpacity }}>
          {/* Anel de glow */}
          <View style={{
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: C.success + '15',
            borderWidth: 1.5, borderColor: C.success + '40',
            alignItems: 'center', justifyContent: 'center', marginBottom: 28,
          }}>
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: C.success + '25',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="checkmark-circle" size={64} color={C.success} />
            </View>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '900', color: C.textPrimary, textAlign: 'center', marginBottom: 10, fontFamily: F.base }}>
            Orçamento Enviado!
          </Text>
          <Text style={{ fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8, fontFamily: F.base }}>
            Recebemos seu pedido com sucesso.{'\n'}Nossa equipe entrará em contato em breve.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 36 }}>
            <Ionicons name="time-outline" size={14} color={C.textDisabled} />
            <Text style={{ color: C.textDisabled, fontSize: 13, fontFamily: F.base }}>Resposta em até 24h</Text>
          </View>

          {/* Barra de progresso automático */}
          <View style={{ width: 180, height: 3, backgroundColor: C.bgElevated, borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
            <Animated.View style={{
              height: '100%', backgroundColor: C.success, borderRadius: 2,
              width: successOpacity.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }} />
          </View>

          <TouchableOpacity onPress={onSuccess} activeOpacity={0.85} style={{ width: '100%' }}>
            <LinearGradient
              colors={[C.amberDeep, C.amber]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: R.md, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Ionicons name="home-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', fontFamily: F.base }}>Ir para Início</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const accentColor = SERVICE_COLORS[serviceType] || C.amber;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

      {/* Header */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 20 }}>
        <View style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: 80, backgroundColor: C.amber, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onBack}
            style={{ marginRight: 14, backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>Nova solicitação</Text>
            <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800', fontFamily: F.base }}>Solicitar Orçamento</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: C.bgBase }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ padding: S.md }}>

          {/* ── Service Type ── */}
          <SectionCard title="Tipo de Serviço">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SERVICE_TYPES.map((type) => {
                const active = serviceType === type;
                const col = SERVICE_COLORS[type] || C.amber;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setServiceType(type)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 12, paddingVertical: 9, borderRadius: R.md, borderWidth: 1.5,
                      borderColor: active ? col : C.border,
                      backgroundColor: active ? col + '20' : C.bgElevated,
                    }}
                  >
                    <Ionicons name={SERVICE_ICONS[type] as any} size={14} color={active ? col : C.textDisabled} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? col : C.textSecondary, fontFamily: F.base }}>
                      {SERVICE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>

          {/* ── Area + Estimate ── */}
          <SectionCard title="Área do Ambiente">
            <DarkInput
              icon="resize-outline"
              placeholder="Ex: 30"
              value={area}
              onChangeText={setArea}
              keyboardType="decimal-pad"
              right={<Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: '600', fontFamily: F.base }}>m²</Text>}
            />
            {estimate > 0 && (
              <View style={{
                marginTop: 12, backgroundColor: accentColor + '18',
                borderRadius: R.md, padding: 12,
                flexDirection: 'row', alignItems: 'center', gap: 10,
                borderWidth: 1, borderColor: accentColor + '35',
              }}>
                <Ionicons name="calculator-outline" size={18} color={accentColor} />
                <View>
                  <Text style={{ color: accentColor, fontWeight: '800', fontSize: 16, fontFamily: F.base }}>
                    R$ {estimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textSecondary, marginTop: 1, fontFamily: F.base }}>*Estimativa aproximada</Text>
                </View>
              </View>
            )}
          </SectionCard>

          {/* ── Description ── */}
          <SectionCard title="Descrição">
            <DarkInput
              icon="document-text-outline"
              placeholder="Descreva o que precisa ser feito, condição atual das paredes, etc."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </SectionCard>

          {/* ── Phone ── */}
          <SectionCard title="Celular para Contato">
            <DarkInput
              icon="call-outline"
              placeholder="(11) 99999-9999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </SectionCard>

          {/* ── Address ── */}
          <SectionCard title="Endereço">
            <DarkInput
              icon="location-outline"
              placeholder="Rua e número"
              value={street}
              onChangeText={setStreet}
              style={{ marginBottom: 10 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <DarkInput icon="business-outline" placeholder="Cidade" value={city} onChangeText={setCity} />
              </View>
              <View style={{ width: 80 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: C.bgElevated,
                  borderWidth: 1.5, borderColor: C.border,
                  borderRadius: R.md, paddingHorizontal: 10,
                }}>
                  <TextInput
                    style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: C.textPrimary, textAlign: 'center', fontFamily: F.base }}
                    placeholder="UF"
                    placeholderTextColor={C.textDisabled}
                    value={state}
                    onChangeText={setState}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>
          </SectionCard>

          {/* ── Photos ── */}
          <SectionCard title="Fotos do Ambiente">
            {photos.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {photos.map((uri, i) => (
                  <View key={i} style={{ position: 'relative' }}>
                    <Image source={{ uri }} style={{ width: 76, height: 76, borderRadius: R.sm, borderWidth: 1, borderColor: C.border }} />
                    <TouchableOpacity
                      onPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        backgroundColor: C.error, borderRadius: 10,
                        width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: C.bgBase,
                      }}
                    >
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { onPress: pickImage, icon: 'images-outline',  label: 'Galeria' },
                { onPress: takePhoto, icon: 'camera-outline',  label: 'Câmera'  },
              ].map((btn) => (
                <TouchableOpacity
                  key={btn.label} onPress={btn.onPress} activeOpacity={0.7}
                  style={{
                    flex: 1, borderWidth: 1.5, borderStyle: 'dashed',
                    borderColor: C.amber + '55', borderRadius: R.md,
                    paddingVertical: 14, alignItems: 'center',
                    flexDirection: 'row', justifyContent: 'center', gap: 6,
                    backgroundColor: C.amberGlow,
                  }}
                >
                  <Ionicons name={btn.icon as any} size={18} color={C.amber} />
                  <Text style={{ color: C.amber, fontSize: 13, fontWeight: '700', fontFamily: F.base }}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* ── Error banner ── */}
          {!!error && (
            <View style={{
              backgroundColor: C.error + '18', borderRadius: R.md,
              borderWidth: 1, borderColor: C.error + '50',
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
            }}>
              <Ionicons name="alert-circle-outline" size={18} color={C.error} />
              <Text style={{ flex: 1, color: C.error, fontSize: 13, fontWeight: '600', fontFamily: F.base }}>{error}</Text>
            </View>
          )}

          {/* ── Submit ── */}
          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85} style={{ marginBottom: 32 }}>
            <LinearGradient
              colors={loading ? [C.bgMuted, C.bgMuted] : [C.amberDeep, C.amber]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: R.md, paddingVertical: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Ionicons name="send" size={18} color={loading ? C.textDisabled : '#fff'} />
              <Text style={{ color: loading ? C.textDisabled : '#fff', fontSize: 16, fontWeight: '800', fontFamily: F.base }}>
                {loading ? 'Enviando...' : 'Enviar Orçamento'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
