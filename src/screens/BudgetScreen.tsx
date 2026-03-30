import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { SERVICE_LABELS } from '../utils/helpers';

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

export function BudgetScreen({ onSuccess, onBack, initialServiceType }: Props) {
  const addBudget = useAppStore((s) => s.addBudget);
  const [serviceType, setServiceType] = useState(initialServiceType || 'internal');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const estimate = area ? Number(area) * (PRICE_MAP[serviceType] || 30) : 0;

  const pickImage = async () => {
    if (photos.length >= 5) return Alert.alert('Limite', 'Máximo de 5 fotos.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permissão', 'Permita acesso à câmera nas configurações.');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!description.trim()) return Alert.alert('Atenção', 'Preencha a descrição do ambiente.');
    if (!area) return Alert.alert('Atenção', 'Informe a área em m².');
    if (!phone.trim()) return Alert.alert('Atenção', 'Informe seu celular para contato.');
    if (!street.trim() || !city.trim() || !state.trim()) return Alert.alert('Atenção', 'Preencha o endereço completo.');

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('serviceType', serviceType);
      fd.append('description', description.trim());
      fd.append('area', area);
      fd.append('phone', phone.trim());
      fd.append('address', JSON.stringify({ street: street.trim(), city: city.trim(), state: state.trim() }));

      // Suporta web (Blob) e nativo (uri object)
      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i];
        if (uri.startsWith('data:') || uri.startsWith('blob:') || typeof window !== 'undefined') {
          // Web: fetch the uri and convert to blob
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            fd.append('photos', blob, `photo_${i}.jpg`);
          } catch {
            fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
          }
        } else {
          // Native
          fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
        }
      }

      const budget = await budgetService.create(fd);
      addBudget(budget);
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Tempo esgotado. O servidor pode estar iniciando, tente novamente.' :
        err.message || 'Falha ao enviar orçamento. Verifique sua conexão e tente novamente.');
      Alert.alert('Erro ao enviar', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Nova solicitação</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Solicitar Orçamento</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ padding: 20 }}>

          {/* Service Type */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Tipo de Serviço</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SERVICE_TYPES.map((type) => {
                const active = serviceType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setServiceType(type)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5,
                      borderColor: active ? '#2563EB' : '#e2e8f0',
                      backgroundColor: active ? '#2563EB' : '#fff',
                    }}
                  >
                    <Ionicons name={SERVICE_ICONS[type] as any} size={14} color={active ? '#fff' : '#64748b'} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : '#64748b' }}>
                      {SERVICE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Area + Estimate */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Área do Ambiente</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
              <Ionicons name="resize-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="Ex: 30"
                placeholderTextColor="#94a3b8"
                value={area}
                onChangeText={setArea}
                keyboardType="decimal-pad"
              />
              <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '600' }}>m²</Text>
            </View>
            {estimate > 0 && (
              <View style={{ marginTop: 10, backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calculator-outline" size={16} color="#2563EB" />
                <View>
                  <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 15 }}>
                    R$ {estimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>*Estimativa aproximada</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Descrição</Text>
            <View style={{ backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingTop: 12 }}>
              <TextInput
                style={{ fontSize: 14, color: '#1e293b', minHeight: 90, textAlignVertical: 'top' }}
                placeholder="Descreva o que precisa ser feito, condição atual das paredes, etc."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
              Celular para Contato <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
              <Ionicons name="call-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Endereço</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 }}>
              <Ionicons name="location-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 14, color: '#1e293b' }}
                placeholder="Rua e número"
                placeholderTextColor="#94a3b8"
                value={street}
                onChangeText={setStreet}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
                <Ionicons name="business-outline" size={16} color="#94a3b8" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 8, fontSize: 14, color: '#1e293b' }}
                  placeholder="Cidade"
                  placeholderTextColor="#94a3b8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ width: 80, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14 }}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: '#1e293b', textAlign: 'center' }}
                  placeholder="UF"
                  placeholderTextColor="#94a3b8"
                  value={state}
                  onChangeText={setState}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          {/* Photos */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Fotos do Ambiente <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(opcional)</Text></Text>
            {photos.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {photos.map((uri, i) => (
                  <View key={i} style={{ position: 'relative' }}>
                    <Image source={{ uri }} style={{ width: 76, height: 76, borderRadius: 12 }} />
                    <TouchableOpacity
                      onPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}
                style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#94a3b8', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <Ionicons name="images-outline" size={18} color="#94a3b8" />
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} activeOpacity={0.7}
                style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#94a3b8', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <Ionicons name="camera-outline" size={18} color="#94a3b8" />
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Câmera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={loading ? ['#93c5fd', '#93c5fd'] : ['#2563EB', '#1d4ed8']}
              style={{ borderRadius: 16, paddingVertical: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? 'Enviando...' : 'Enviar Orçamento'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
