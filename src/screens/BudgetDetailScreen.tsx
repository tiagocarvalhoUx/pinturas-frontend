import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Budget } from '../store/appStore';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate } from '../utils/helpers';

interface Props {
  budgetId: string;
  onBack: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  internal: 'home', external: 'business', texture: 'color-palette',
  lacquering: 'sparkles', waterproofing: 'water', restoration: 'construct',
};
const SERVICE_COLOR: Record<string, string> = {
  internal: '#2563EB', external: '#7c3aed', texture: '#d97706',
  lacquering: '#dc2626', waterproofing: '#0891b2', restoration: '#059669',
};

const STEPS = ['pending', 'quoted', 'approved', 'in_progress', 'completed'];
const STEP_LABELS: Record<string, string> = {
  pending: 'Pendente', quoted: 'Orçado', approved: 'Aprovado',
  in_progress: 'Em Andamento', completed: 'Concluído',
};
const STEP_ICONS: Record<string, string> = {
  pending: 'time-outline', quoted: 'document-text-outline', approved: 'checkmark-circle-outline',
  in_progress: 'construct-outline', completed: 'trophy-outline',
};

// What admin can do at each status
const ADMIN_NEXT: Record<string, { label: string; next: string; color: string; icon: string } | null> = {
  pending:     { label: 'Enviar Orçamento ao Cliente', next: 'quoted',      color: '#2563EB', icon: 'send-outline' },
  quoted:      { label: 'Marcar como Aprovado',        next: 'approved',    color: '#7c3aed', icon: 'checkmark-circle-outline' },
  approved:    { label: 'Iniciar Execução',            next: 'in_progress', color: '#0891b2', icon: 'construct-outline' },
  in_progress: { label: 'Marcar como Concluído',       next: 'completed',   color: '#059669', icon: 'trophy-outline' },
  completed:   null,
  cancelled:   null,
};

// What client can do at each status
const CLIENT_NEXT: Record<string, { label: string; next: string; color: string; icon: string } | null> = {
  pending:     null,
  quoted:      { label: 'Aprovar Orçamento', next: 'approved', color: '#059669', icon: 'checkmark-circle-outline' },
  approved:    null,
  in_progress: null,
  completed:   null,
  cancelled:   null,
};

export function BudgetDetailScreen({ budgetId, onBack }: Props) {
  const user = useAppStore((s) => s.user);
  const budgets = useAppStore((s) => s.budgets);
  const updateBudgetStore = useAppStore((s) => s.updateBudget);

  const [budget, setBudget] = useState<Budget | null>(budgets.find((b) => b._id === budgetId) || null);
  const [loading, setLoading] = useState(!budget);
  const [updating, setUpdating] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Quote modal (admin only, to set price when moving to 'quoted')
  const [quoteModal, setQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDate, setQuoteDate] = useState('');

  // Rating modal (client, after completed)
  const [ratingModal, setRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    budgetService.getById(budgetId)
      .then(setBudget)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o orçamento.'))
      .finally(() => setLoading(false));
  }, [budgetId]);

  if (loading) return <LoadingSpinner message="Carregando..." />;
  if (!budget) return null;

  const isAdmin = user?.role === 'admin';
  const statusColor = STATUS_COLORS[budget.status] || '#6b7280';
  const iconColor = SERVICE_COLOR[budget.serviceType] || '#2563EB';
  const price = budget.finalPrice ?? budget.estimatedPrice;
  const stepIndex = STEPS.indexOf(budget.status);
  const isCancelled = budget.status === 'cancelled';

  const nextAction = isAdmin ? ADMIN_NEXT[budget.status] : CLIENT_NEXT[budget.status];
  const canCancel = isAdmin && budget.status !== 'completed' && budget.status !== 'cancelled';
  const canRate = !isAdmin && budget.status === 'completed' && !budget.rating;

  const applyUpdate = (updated: Budget) => {
    setBudget(updated);
    updateBudgetStore(updated._id, updated);
  };

  const showMsg = (title: string, msg: string) => {
    if (typeof window !== 'undefined') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleAdvance = async (nextStatus: string, extra?: Record<string, any>) => {
    setUpdating(true);
    try {
      const updated = await budgetService.update(budgetId, { status: nextStatus, ...extra });
      applyUpdate(updated);
      showMsg('✅ Atualizado!', `Status alterado para: ${STATUS_LABELS[nextStatus]}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Verifique sua conexão.';
      showMsg('Erro', `Não foi possível atualizar o status.\n${msg}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuoteSubmit = async () => {
    if (!quotePrice || isNaN(Number(quotePrice))) {
      return Alert.alert('Atenção', 'Informe um valor válido.');
    }
    setQuoteModal(false);
    await handleAdvance('quoted', {
      estimatedPrice: Number(quotePrice),
      ...(quoteDate ? { scheduledDate: quoteDate } : {}),
    });
    setQuotePrice('');
    setQuoteDate('');
  };

  const handleCancel = () => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Tem certeza que deseja cancelar este orçamento?')
      : false;
    if (confirmed) {
      handleAdvance('cancelled');
    } else if (typeof window === 'undefined') {
      Alert.alert('Cancelar Pedido', 'Tem certeza?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => handleAdvance('cancelled') },
      ]);
    }
  };

  const handleRatingSubmit = async () => {
    if (ratingStars === 0) return showMsg('Atenção', 'Selecione ao menos 1 estrela.');
    setSubmittingRating(true);
    try {
      const updated = await budgetService.rate(budgetId, ratingStars, ratingComment);
      applyUpdate(updated);
      setRatingModal(false);
      showMsg('Obrigado!', 'Sua avaliação foi enviada.');
    } catch {
      showMsg('Erro', 'Não foi possível enviar a avaliação.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleNextPress = () => {
    if (!nextAction) return;
    // Admin quoting: show modal to set price
    if (isAdmin && nextAction.next === 'quoted') {
      setQuoteModal(true);
      return;
    }
    // Client approving: confirm first
    if (!isAdmin && nextAction.next === 'approved') {
      Alert.alert(
        'Aprovar Orçamento',
        `Deseja aprovar o orçamento de ${price ? formatCurrency(price) : 'valor a definir'}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Aprovar', onPress: () => handleAdvance('approved') },
        ]
      );
      return;
    }
    handleAdvance(nextAction.next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={onBack} style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, marginRight: 12 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Detalhes do Pedido</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
              {SERVICE_LABELS[budget.serviceType]}
            </Text>
          </View>
          <View style={{ backgroundColor: statusColor + '40', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{STATUS_LABELS[budget.status]}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {budget.finalPrice ? 'Valor Final' : 'Estimativa'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 }}>
              {price ? formatCurrency(price) : 'A calcular'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Área</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{budget.area} m²</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ── ACTION BUTTONS (logo no topo, bem visível) ── */}
        {updating ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
            <ActivityIndicator color="#2563EB" />
            <Text style={{ color: '#64748b', fontSize: 14 }}>Atualizando status...</Text>
          </View>
        ) : nextAction ? (
          <TouchableOpacity onPress={handleNextPress} activeOpacity={0.85} style={{ marginBottom: 12 }}>
            <LinearGradient
              colors={[nextAction.color, nextAction.color + 'dd']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: nextAction.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
              <Ionicons name={nextAction.icon as any} size={22} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>{nextAction.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : !isCancelled && !isAdmin && budget.status === 'pending' ? (
          // Client info when pending
          <View style={{ backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fde68a' }}>
            <Ionicons name="time-outline" size={24} color="#d97706" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400e' }}>Aguardando análise</Text>
              <Text style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Nossa equipe está analisando seu pedido e em breve enviaremos o orçamento.</Text>
            </View>
          </View>
        ) : !isCancelled && !isAdmin && budget.status === 'approved' ? (
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#065f46' }}>Orçamento Aprovado</Text>
              <Text style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>Nossa equipe iniciará o serviço em breve. Aguarde o contato.</Text>
            </View>
          </View>
        ) : !isCancelled && !isAdmin && budget.status === 'in_progress' ? (
          <View style={{ backgroundColor: '#ecfeff', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#a5f3fc' }}>
            <Ionicons name="construct" size={24} color="#0891b2" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#164e63' }}>Serviço em Andamento</Text>
              <Text style={{ fontSize: 12, color: '#0e7490', marginTop: 2 }}>O serviço está sendo executado. Qualquer dúvida, fale conosco pelo Chat.</Text>
            </View>
          </View>
        ) : null}

        {/* Cancel button (admin) */}
        {canCancel && !updating && (
          <TouchableOpacity onPress={handleCancel} activeOpacity={0.8}
            style={{ borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, backgroundColor: '#fff' }}>
            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600' }}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}

        {/* Rate button (client, completed) */}
        {canRate && (
          <TouchableOpacity onPress={() => setRatingModal(true)} activeOpacity={0.85} style={{ marginBottom: 12 }}>
            <LinearGradient colors={['#f59e0b', '#d97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Avaliar Serviço</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Progress Tracker */}
        {!isCancelled ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 18 }}>Progresso do Pedido</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const isCurrent = i === stepIndex;
                const isLast = i === STEPS.length - 1;
                return (
                  <React.Fragment key={step}>
                    <View style={{ alignItems: 'center', flex: isLast ? 0 : undefined }}>
                      <View style={{
                        width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: done ? (isCurrent ? '#2563EB' : '#059669') : '#f1f5f9',
                        borderWidth: isCurrent ? 3 : 0,
                        borderColor: '#93c5fd',
                        shadowColor: isCurrent ? '#2563EB' : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: isCurrent ? 4 : 0,
                      }}>
                        <Ionicons
                          name={(done ? (isCurrent ? STEP_ICONS[step] : 'checkmark') : STEP_ICONS[step]) as any}
                          size={isCurrent ? 17 : 15}
                          color={done ? '#fff' : '#94a3b8'}
                        />
                      </View>
                      <Text style={{
                        fontSize: 9, marginTop: 6, textAlign: 'center', width: 52,
                        color: done ? (isCurrent ? '#2563EB' : '#059669') : '#94a3b8',
                        fontWeight: isCurrent ? '800' : done ? '600' : '400',
                      }} numberOfLines={2}>
                        {STEP_LABELS[step]}
                      </Text>
                    </View>
                    {!isLast && (
                      <View style={{
                        flex: 1, height: 3, marginTop: 16,
                        backgroundColor: i < stepIndex ? '#059669' : '#e2e8f0',
                        borderRadius: 2,
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: '#fef2f2', borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fecaca' }}>
            <Ionicons name="close-circle" size={28} color="#dc2626" />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#dc2626' }}>Pedido Cancelado</Text>
              <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>Este orçamento foi cancelado.</Text>
            </View>
          </View>
        )}

        {/* Service Info */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 14 }}>Informações do Serviço</Text>

          {[
            { icon: SERVICE_ICONS[budget.serviceType] || 'brush', label: 'Tipo', value: SERVICE_LABELS[budget.serviceType], color: iconColor },
            { icon: 'document-text-outline', label: 'Descrição', value: budget.description, color: '#64748b' },
            ...(budget.phone ? [{ icon: 'call-outline', label: 'Celular para Contato', value: budget.phone, color: '#059669' }] : []),
            { icon: 'location-outline', label: 'Endereço', value: `${budget.address.street}, ${budget.address.city} - ${budget.address.state}`, color: '#64748b' },
            { icon: 'calendar-outline', label: 'Criado em', value: formatDate(budget.createdAt), color: '#64748b' },
            ...(budget.scheduledDate ? [{ icon: 'time-outline', label: 'Agendado para', value: formatDate(budget.scheduledDate), color: '#059669' }] : []),
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={row.icon as any} size={18} color={row.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2 }}>{row.label}</Text>
                <Text style={{ fontSize: 14, color: '#1e293b', fontWeight: '500' }}>{row.value}</Text>
              </View>
            </View>
          ))}

          {isAdmin && budget.client && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person-outline" size={18} color="#64748b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2 }}>Cliente</Text>
                <Text style={{ fontSize: 14, color: '#1e293b', fontWeight: '500' }}>{budget.client.name}</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>{budget.client.email}</Text>
                {budget.client.phone && <Text style={{ fontSize: 12, color: '#94a3b8' }}>{budget.client.phone}</Text>}
              </View>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>Fotos do Ambiente</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{budget.photos?.length || 0} foto{(budget.photos?.length || 0) !== 1 ? 's' : ''}</Text>
          </View>

          {budget.photos?.length > 0 ? (
            <>
              <Image
                source={{ uri: budget.photos[photoIndex].url }}
                style={{ width: '100%', height: 220, borderRadius: 14, marginBottom: 10, backgroundColor: '#f1f5f9' }}
                resizeMode="cover"
              />
              {budget.photos.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {budget.photos.map((p, i) => (
                    <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)} style={{ marginRight: 8 }}>
                      <Image
                        source={{ uri: p.url }}
                        style={{ width: 64, height: 64, borderRadius: 10, borderWidth: 2.5, borderColor: i === photoIndex ? '#2563EB' : 'transparent', backgroundColor: '#f1f5f9' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={{ height: 100, backgroundColor: '#f8fafc', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Ionicons name="images-outline" size={28} color="#cbd5e1" />
              <Text style={{ fontSize: 13, color: '#94a3b8' }}>Nenhuma foto enviada</Text>
            </View>
          )}
        </View>

        {/* Existing Rating */}
        {budget.rating && (
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 10 }}>Avaliação do Cliente</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8, gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name={s <= budget.rating!.stars ? 'star' : 'star-outline'} size={24} color="#f59e0b" />
              ))}
            </View>
            {budget.rating.comment ? (
              <Text style={{ fontSize: 14, color: '#475569', fontStyle: 'italic' }}>"{budget.rating.comment}"</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Quote Modal (admin) */}
      <Modal visible={quoteModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>Enviar Orçamento</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Informe o valor e data para o cliente aprovar.</Text>

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Valor do Orçamento (R$) *</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 }}>
              <Ionicons name="cash-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="Ex: 2500.00"
                placeholderTextColor="#94a3b8"
                value={quotePrice}
                onChangeText={setQuotePrice}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Data Prevista (opcional)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 24 }}>
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' }}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#94a3b8"
                value={quoteDate}
                onChangeText={setQuoteDate}
              />
            </View>

            <TouchableOpacity onPress={handleQuoteSubmit} activeOpacity={0.85}>
              <LinearGradient colors={['#2563EB', '#1d4ed8']} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Enviar Orçamento ao Cliente</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQuoteModal(false)} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal (client) */}
      <Modal visible={ratingModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>Avaliar Serviço</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Como foi sua experiência?</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRatingStars(s)}>
                  <Ionicons name={s <= ratingStars ? 'star' : 'star-outline'} size={40} color="#f59e0b" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Comentário (opcional)</Text>
            <View style={{ backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 24 }}>
              <TextInput
                style={{ fontSize: 14, color: '#1e293b', minHeight: 80, textAlignVertical: 'top', paddingVertical: 10 }}
                placeholder="Conte como foi o serviço..."
                placeholderTextColor="#94a3b8"
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
              />
            </View>

            <TouchableOpacity onPress={handleRatingSubmit} disabled={submittingRating} activeOpacity={0.85}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {submittingRating ? <ActivityIndicator color="#fff" /> : <Ionicons name="star" size={18} color="#fff" />}
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Enviar Avaliação</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRatingModal(false)} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
