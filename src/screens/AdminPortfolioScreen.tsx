import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, Alert, Modal, Switch, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { SERVICE_LABELS } from '../utils/helpers';
import { C, R, S, F } from '../theme';

interface Props { onBack: () => void }

interface PortfolioItem {
  _id: string;
  title: string;
  serviceType: string;
  beforeImage?: { url: string };
  afterImage?: { url: string };
  area?: number;
  duration?: string;
  location?: string;
  featured: boolean;
  description?: string;
}

const SERVICE_TYPES = [
  { value: 'internal',      label: 'Pintura Interna' },
  { value: 'external',      label: 'Pintura Externa' },
  { value: 'texture',       label: 'Textura' },
  { value: 'lacquering',    label: 'Laqueação' },
  { value: 'waterproofing', label: 'Impermeabilização' },
  { value: 'restoration',   label: 'Restauração' },
];

const EMPTY_FORM = {
  title: '', description: '', serviceType: 'internal',
  area: '', duration: '', location: '', featured: false,
};

export function AdminPortfolioScreen({ onBack }: Props) {
  const [items, setItems]         = useState<PortfolioItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editItem, setEditItem]   = useState<PortfolioItem | null>(null);

  const [form, setForm]     = useState({ ...EMPTY_FORM });
  const [beforeImg, setBeforeImg] = useState<{ uri: string; name: string } | null>(null);
  const [afterImg, setAfterImg]   = useState<{ uri: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio');
      setItems(res.data.portfolio || []);
    } catch { /* keep */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setBeforeImg(null);
    setAfterImg(null);
    setModalOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      serviceType: item.serviceType,
      area: item.area ? String(item.area) : '',
      duration: item.duration || '',
      location: item.location || '',
      featured: item.featured,
    });
    setBeforeImg(null);
    setAfterImg(null);
    setModalOpen(true);
  };

  const pickImage = async (type: 'before' | 'after') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão necessária', 'Permita acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name  = asset.uri.split('/').pop() || `${type}.jpg`;
      if (type === 'before') setBeforeImg({ uri: asset.uri, name });
      else                   setAfterImg({ uri: asset.uri, name });
    }
  };

  const save = async () => {
    if (!form.title.trim()) { Alert.alert('Atenção', 'Informe o título.'); return; }
    if (!form.serviceType)  { Alert.alert('Atenção', 'Selecione o tipo de serviço.'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('serviceType', form.serviceType);
      fd.append('area',        form.area);
      fd.append('duration',    form.duration.trim());
      fd.append('location',    form.location.trim());
      fd.append('featured',    String(form.featured));

      if (beforeImg) {
        fd.append('before', { uri: beforeImg.uri, name: beforeImg.name, type: 'image/jpeg' } as any);
      }
      if (afterImg) {
        fd.append('after', { uri: afterImg.uri, name: afterImg.name, type: 'image/jpeg' } as any);
      }

      if (editItem) {
        await api.patch(`/portfolio/${editItem._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/portfolio', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalOpen(false);
      load();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (item: PortfolioItem) => {
    Alert.alert('Excluir', `Excluir "${item.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/portfolio/${item._id}`);
            load();
          } catch { Alert.alert('Erro', 'Não foi possível excluir.'); }
        },
      },
    ]);
  };

  const serviceColor = (type: string) => ({
    internal: C.amber, external: C.blue, texture: C.terra,
    lacquering: C.purple, waterproofing: C.green, restoration: C.amberLight,
  }[type] || C.amber);

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>
      {/* Header */}
      <View style={{
        backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md,
        paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}
        >
          <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textSecondary, fontSize: 11, letterSpacing: 0.5, fontFamily: F.base }}>Admin</Text>
          <Text style={{ color: C.textPrimary, fontSize: 17, fontWeight: '800', fontFamily: F.base }}>Gerenciar Portfólio</Text>
        </View>
        <TouchableOpacity
          onPress={openCreate}
          style={{ backgroundColor: C.amber, borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, fontFamily: F.base }}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.amber} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: S.md, gap: 12 }} showsVerticalScrollIndicator={false}>
          {items.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="images-outline" size={48} color={C.textDisabled} />
              <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: 14, fontFamily: F.base }}>
                Nenhum item no portfólio
              </Text>
              <TouchableOpacity
                onPress={openCreate}
                style={{ marginTop: 16, backgroundColor: C.amber, borderRadius: R.md, paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontFamily: F.base }}>Criar primeiro item</Text>
              </TouchableOpacity>
            </View>
          )}

          {items.map((item) => {
            const color = serviceColor(item.serviceType);
            return (
              <View key={item._id} style={{
                backgroundColor: C.bgSurface, borderRadius: R.lg,
                borderWidth: 1, borderColor: C.border, overflow: 'hidden',
              }}>
                {/* Thumbnail */}
                <View style={{ height: 130, backgroundColor: C.bgElevated }}>
                  {item.afterImage?.url ? (
                    <Image source={{ uri: item.afterImage.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : item.beforeImage?.url ? (
                    <Image source={{ uri: item.beforeImage.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="image-outline" size={36} color={C.textDisabled} />
                    </View>
                  )}
                  {item.featured && (
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: C.amber, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="star" size={10} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: F.base }}>DESTAQUE</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={{ padding: S.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ backgroundColor: color + '20', borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: color + '40' }}>
                      <Text style={{ color, fontSize: 11, fontWeight: '700', fontFamily: F.base }}>{SERVICE_LABELS[item.serviceType]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => openEdit(item)} style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 7, borderWidth: 1, borderColor: C.border }}>
                        <Ionicons name="pencil" size={15} color={C.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => remove(item)} style={{ backgroundColor: '#ff000018', borderRadius: R.sm, padding: 7, borderWidth: 1, borderColor: '#ff000030' }}>
                        <Ionicons name="trash-outline" size={15} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 15, fontFamily: F.base }}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                    {item.area && <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>{item.area} m²</Text>}
                    {item.duration && <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>{item.duration}</Text>}
                    {item.location && <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>{item.location}</Text>}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal Form */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: C.bgBase }}>
          {/* Modal Header */}
          <View style={{
            backgroundColor: C.bgDeep, paddingTop: 20, paddingHorizontal: S.md,
            paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <TouchableOpacity onPress={() => setModalOpen(false)} style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name="close" size={20} color={C.textPrimary} />
            </TouchableOpacity>
            <Text style={{ flex: 1, color: C.textPrimary, fontSize: 17, fontWeight: '800', fontFamily: F.base }}>
              {editItem ? 'Editar Item' : 'Novo Item'}
            </Text>
            <TouchableOpacity
              onPress={save}
              disabled={saving}
              style={{ backgroundColor: C.amber, borderRadius: R.sm, paddingHorizontal: 16, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={18} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, fontFamily: F.base }}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: S.md, gap: 16 }} showsVerticalScrollIndicator={false}>
            {/* Fotos */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 14, marginBottom: 12, fontFamily: F.base }}>Fotos</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Antes */}
                <TouchableOpacity onPress={() => pickImage('before')} style={{ flex: 1 }}>
                  <View style={{ height: 110, borderRadius: R.md, overflow: 'hidden', backgroundColor: C.bgElevated, borderWidth: 2, borderColor: beforeImg ? C.amber : C.border, borderStyle: beforeImg ? 'solid' : 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                    {beforeImg ? (
                      <Image source={{ uri: beforeImg.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : editItem?.beforeImage?.url ? (
                      <>
                        <Image source={{ uri: editItem.beforeImage.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontFamily: F.base }}>toque para trocar</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={28} color={C.textDisabled} />
                        <Text style={{ color: C.textDisabled, fontSize: 11, marginTop: 4, fontFamily: F.base }}>Foto Antes</Text>
                      </>
                    )}
                  </View>
                  <Text style={{ color: C.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 4, fontFamily: F.base }}>ANTES</Text>
                </TouchableOpacity>

                {/* Depois */}
                <TouchableOpacity onPress={() => pickImage('after')} style={{ flex: 1 }}>
                  <View style={{ height: 110, borderRadius: R.md, overflow: 'hidden', backgroundColor: C.bgElevated, borderWidth: 2, borderColor: afterImg ? C.amber : C.border, borderStyle: afterImg ? 'solid' : 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                    {afterImg ? (
                      <Image source={{ uri: afterImg.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : editItem?.afterImage?.url ? (
                      <>
                        <Image source={{ uri: editItem.afterImage.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontFamily: F.base }}>toque para trocar</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={28} color={C.textDisabled} />
                        <Text style={{ color: C.textDisabled, fontSize: 11, marginTop: 4, fontFamily: F.base }}>Foto Depois</Text>
                      </>
                    )}
                  </View>
                  <Text style={{ color: C.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 4, fontFamily: F.base }}>DEPOIS</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Título */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, fontFamily: F.base }}>TÍTULO *</Text>
              <TextInput
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="Ex: Sala de Estar Moderna"
                placeholderTextColor={C.textDisabled}
                style={{ color: C.textPrimary, fontSize: 15, fontFamily: F.base }}
              />
            </View>

            {/* Descrição */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, fontFamily: F.base }}>DESCRIÇÃO</Text>
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Descreva o projeto..."
                placeholderTextColor={C.textDisabled}
                multiline
                numberOfLines={3}
                style={{ color: C.textPrimary, fontSize: 14, fontFamily: F.base, minHeight: 70 }}
              />
            </View>

            {/* Tipo de Serviço */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5, fontFamily: F.base }}>TIPO DE SERVIÇO *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SERVICE_TYPES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setForm((f) => ({ ...f, serviceType: s.value }))}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 7,
                      borderRadius: R.full, borderWidth: 1,
                      backgroundColor: form.serviceType === s.value ? C.amber : 'transparent',
                      borderColor: form.serviceType === s.value ? C.amber : C.border,
                    }}
                  >
                    <Text style={{ color: form.serviceType === s.value ? '#fff' : C.textSecondary, fontSize: 12, fontWeight: '700', fontFamily: F.base }}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalhes */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border, gap: 14 }}>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, fontFamily: F.base }}>DETALHES</Text>
              {[
                { key: 'area',     label: 'Área (m²)',   placeholder: 'Ex: 45',           keyboard: 'numeric' as const },
                { key: 'duration', label: 'Duração',     placeholder: 'Ex: 3 dias',        keyboard: 'default' as const },
                { key: 'location', label: 'Local',       placeholder: 'Ex: Araçatuba, SP', keyboard: 'default' as const },
              ].map((field) => (
                <View key={field.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ color: C.textSecondary, fontSize: 13, width: 80, fontFamily: F.base }}>{field.label}</Text>
                  <TextInput
                    value={(form as any)[field.key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.textDisabled}
                    keyboardType={field.keyboard}
                    style={{ flex: 1, color: C.textPrimary, fontSize: 14, fontFamily: F.base, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 4 }}
                  />
                </View>
              ))}
            </View>

            {/* Destaque */}
            <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: F.base }}>Marcar como destaque</Text>
                <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>Aparece em evidência na home</Text>
              </View>
              <Switch
                value={form.featured}
                onValueChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                trackColor={{ true: C.amber, false: C.bgElevated }}
                thumbColor="#fff"
              />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
