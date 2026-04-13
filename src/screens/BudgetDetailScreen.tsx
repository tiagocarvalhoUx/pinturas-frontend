import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { budgetService } from '../services/budgets';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Budget } from '../store/appStore';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate } from '../utils/helpers';
import { C, R, S, F } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  budgetId: string;
  onBack: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  internal: 'home', external: 'business', texture: 'color-palette',
  lacquering: 'sparkles', waterproofing: 'water', restoration: 'construct',
};
const SERVICE_COLOR: Record<string, string> = {
  internal: C.amber, external: C.blue, texture: C.terra,
  lacquering: C.purple, waterproofing: C.green, restoration: C.amberLight,
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

const ADMIN_NEXT: Record<string, { label: string; next: string; icon: string } | null> = {
  pending:     { label: 'Enviar Orçamento ao Cliente', next: 'quoted',      icon: 'send-outline'             },
  quoted:      { label: 'Marcar como Aprovado',        next: 'approved',    icon: 'checkmark-circle-outline' },
  approved:    { label: 'Iniciar Execução',            next: 'in_progress', icon: 'construct-outline'        },
  in_progress: { label: 'Marcar como Concluído',       next: 'completed',   icon: 'trophy-outline'           },
  completed: null, cancelled: null,
};
const CLIENT_NEXT: Record<string, { label: string; next: string; icon: string } | null> = {
  pending: null,
  quoted:      { label: 'Aprovar Orçamento', next: 'approved', icon: 'checkmark-circle-outline' },
  approved: null, in_progress: null, completed: null, cancelled: null,
};

// Dark modal input helper
function ModalInput({ label, icon, placeholder, value, onChangeText, keyboardType }: {
  label: string; icon: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: 14 }}>
        <Ionicons name={icon as any} size={18} color={C.textDisabled} />
        <TextInput
          style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: C.textPrimary, fontFamily: F.base }}
          placeholder={placeholder}
          placeholderTextColor={C.textDisabled}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

// ── Full-screen photo lightbox ───────────────────────────────────────────────
function PhotoLightbox({ photos, index, visible, onClose }: {
  photos: { url: string }[];
  index: number;
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { setCurrent(index); }, [index]);
  useEffect(() => {
    Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', opacity, justifyContent: 'center', alignItems: 'center' }}>

        {/* Close */}
        <TouchableOpacity onPress={onClose} style={{
          position: 'absolute', top: 52, right: 20, zIndex: 10,
          width: 42, height: 42, borderRadius: 21,
          backgroundColor: 'rgba(255,255,255,0.12)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Counter */}
        {photos.length > 1 && (
          <View style={{ position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: F.base }}>{current + 1} / {photos.length}</Text>
            </View>
          </View>
        )}

        {/* Main image */}
        <Image
          source={{ uri: photos[current]?.url }}
          style={{ width: W, height: H * 0.75 }}
          resizeMode="contain"
        />

        {/* Prev / Next */}
        {photos.length > 1 && (
          <>
            <TouchableOpacity
              onPress={() => setCurrent((i) => (i > 0 ? i - 1 : photos.length - 1))}
              style={{ position: 'absolute', left: 16, top: '50%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrent((i) => (i < photos.length - 1 ? i + 1 : 0))}
              style={{ position: 'absolute', right: 16, top: '50%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* Dots */}
        {photos.length > 1 && (
          <View style={{ position: 'absolute', bottom: 52, flexDirection: 'row', gap: 6 }}>
            {photos.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
                <View style={{ width: i === current ? 24 : 7, height: 7, borderRadius: 4, backgroundColor: i === current ? C.amber : 'rgba(255,255,255,0.3)' }} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

export function BudgetDetailScreen({ budgetId, onBack }: Props) {
  const user                = useAppStore((s) => s.user);
  const budgets             = useAppStore((s) => s.budgets);
  const updateBudgetStore   = useAppStore((s) => s.updateBudget);

  const [budget, setBudget]         = useState<Budget | null>(budgets.find((b) => b._id === budgetId) || null);
  const [loading, setLoading]       = useState(!budget);
  const [updating, setUpdating]     = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [quoteModal, setQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDate, setQuoteDate]   = useState('');

  const [successBanner, setSuccessBanner] = useState('');

  const [ratingModal, setRatingModal]         = useState(false);
  const [ratingStars, setRatingStars]         = useState(0);
  const [ratingComment, setRatingComment]     = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    budgetService.getById(budgetId)
      .then(setBudget)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [budgetId]);

  if (loading) return <LoadingSpinner message="Carregando..." />;
  if (!budget) return null;

  const isAdmin     = user?.role === 'admin';
  const statusColor = STATUS_COLORS[budget.status] || C.textSecondary;
  const iconColor   = SERVICE_COLOR[budget.serviceType] || C.amber;
  const price       = budget.finalPrice ?? budget.estimatedPrice;
  const stepIndex   = STEPS.indexOf(budget.status);
  const isCancelled = budget.status === 'cancelled';
  const nextAction  = isAdmin ? ADMIN_NEXT[budget.status] : CLIENT_NEXT[budget.status];
  const canCancel   = isAdmin && budget.status !== 'completed' && budget.status !== 'cancelled';
  const canRate     = !isAdmin && budget.status === 'completed' && !budget.rating;

  const applyUpdate = (updated: Budget) => { setBudget(updated); updateBudgetStore(updated._id, updated); };

  const handleAdvance = async (nextStatus: string, extra?: Record<string, any>) => {
    setUpdating(true);
    try {
      const updated = await budgetService.update(budgetId, { status: nextStatus, ...extra });
      applyUpdate(updated);
      const label = STATUS_LABELS[nextStatus] || nextStatus;
      setSuccessBanner(`Status atualizado: ${label}`);
      // If admin just sent a quote, go back after showing success
      if (isAdmin && nextStatus === 'quoted') {
        setTimeout(() => onBack(), 2500);
      } else {
        setTimeout(() => setSuccessBanner(''), 3000);
      }
    } catch (err: any) {
      setSuccessBanner('');
    } finally { setUpdating(false); }
  };

  const handleQuoteSubmit = async () => {
    if (!quotePrice || isNaN(Number(quotePrice))) return;
    setQuoteModal(false);
    await handleAdvance('quoted', { estimatedPrice: Number(quotePrice), ...(quoteDate ? { scheduledDate: quoteDate } : {}) });
    setQuotePrice(''); setQuoteDate('');
  };

  const handleCancel = () => {
    const confirmed = typeof window !== 'undefined' ? window.confirm('Cancelar este orçamento?') : false;
    if (confirmed) { handleAdvance('cancelled'); return; }
  };

  const handleRatingSubmit = async () => {
    if (ratingStars === 0) return;
    setSubmittingRating(true);
    try {
      const updated = await budgetService.rate(budgetId, ratingStars, ratingComment);
      applyUpdate(updated); setRatingModal(false);
      setSuccessBanner('Avaliação enviada com sucesso!');
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch { }
    finally { setSubmittingRating(false); }
  };

  const handleNextPress = () => {
    if (!nextAction) return;
    if (isAdmin && nextAction.next === 'quoted') { setQuoteModal(true); return; }
    if (!isAdmin && nextAction.next === 'approved') {
      const ok = typeof window !== 'undefined'
        ? window.confirm(`Aprovar orçamento por ${price ? formatCurrency(price) : 'valor a definir'}?`)
        : false;
      if (ok) handleAdvance('approved');
      return;
    }
    handleAdvance(nextAction.next);
  };

  const statusBanners: Record<string, { icon: string; title: string; body: string; accent: string }> = {
    pending:     { icon: 'time-outline',     title: 'Aguardando análise',    body: 'Nossa equipe está analisando seu pedido e em breve enviaremos o orçamento.', accent: C.warning },
    approved:    { icon: 'checkmark-circle', title: 'Orçamento Aprovado',    body: 'Nossa equipe iniciará o serviço em breve.', accent: C.success },
    in_progress: { icon: 'construct',        title: 'Serviço em Andamento',  body: 'O serviço está sendo executado. Qualquer dúvida, fale conosco pelo Chat.', accent: C.info },
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>

      {/* ── Success banner (top) ── */}
      {!!successBanner && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          backgroundColor: C.success, paddingTop: 52, paddingBottom: 14,
          paddingHorizontal: S.md, flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', flex: 1, fontFamily: F.base }}>{successBanner}</Text>
        </View>
      )}

      {/* ── Header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 20 }}>
        <View style={{ position: 'absolute', top: 0, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: iconColor, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={onBack} style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, marginRight: 12, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>Detalhes do Pedido</Text>
            <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800', fontFamily: F.base }} numberOfLines={1}>
              {SERVICE_LABELS[budget.serviceType]}
            </Text>
          </View>
          <View style={{ backgroundColor: statusColor + '25', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: statusColor + '50' }}>
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700', fontFamily: F.base }}>{STATUS_LABELS[budget.status]}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: C.bgElevated, borderRadius: R.md, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.border }}>
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 11, marginBottom: 4, fontFamily: F.base }}>
              {budget.finalPrice ? 'Valor Final' : 'Estimativa'}
            </Text>
            <Text style={{ color: iconColor, fontSize: 24, fontWeight: '800', fontFamily: F.base }}>
              {price ? formatCurrency(price) : 'A calcular'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.textSecondary, fontSize: 11, marginBottom: 4, fontFamily: F.base }}>Área</Text>
            <Text style={{ color: C.textPrimary, fontSize: 20, fontWeight: '700', fontFamily: F.base }}>{budget.area} m²</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: S.md, paddingBottom: 48 }}>

        {/* ── Action button ── */}
        {updating ? (
          <View style={{ backgroundColor: C.bgSurface, borderRadius: R.md, paddingVertical: 15, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: C.border }}>
            <ActivityIndicator color={C.amber} />
            <Text style={{ color: C.textSecondary, fontSize: 14, fontFamily: F.base }}>Atualizando status...</Text>
          </View>
        ) : nextAction ? (
          <TouchableOpacity onPress={handleNextPress} activeOpacity={0.85} style={{ marginBottom: 12 }}>
            <LinearGradient
              colors={[C.amberDeep, C.amber]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: R.md, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Ionicons name={nextAction.icon as any} size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', fontFamily: F.base }}>{nextAction.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : !isCancelled && !isAdmin && statusBanners[budget.status] ? (
          <View style={{
            backgroundColor: statusBanners[budget.status].accent + '18',
            borderRadius: R.md, padding: 14, marginBottom: 12,
            flexDirection: 'row', alignItems: 'center', gap: 12,
            borderWidth: 1, borderColor: statusBanners[budget.status].accent + '40',
          }}>
            <Ionicons name={statusBanners[budget.status].icon as any} size={24} color={statusBanners[budget.status].accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: statusBanners[budget.status].accent, fontFamily: F.base }}>
                {statusBanners[budget.status].title}
              </Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, fontFamily: F.base }}>
                {statusBanners[budget.status].body}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Cancel */}
        {canCancel && !updating && (
          <TouchableOpacity onPress={handleCancel} activeOpacity={0.8}
            style={{ borderWidth: 1.5, borderColor: C.error + '50', borderRadius: R.md, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, backgroundColor: C.error + '12' }}>
            <Ionicons name="close-circle-outline" size={18} color={C.error} />
            <Text style={{ color: C.error, fontSize: 14, fontWeight: '700', fontFamily: F.base }}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}

        {/* Rate */}
        {canRate && (
          <TouchableOpacity onPress={() => setRatingModal(true)} activeOpacity={0.85} style={{ marginBottom: 12 }}>
            <LinearGradient
              colors={[C.amberDeep, C.amber]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: R.md, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: F.base }}>Avaliar Serviço</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Progress Tracker ── */}
        {!isCancelled ? (
          <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 18, fontFamily: F.base }}>Progresso do Pedido</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {STEPS.map((step, i) => {
                const done      = i <= stepIndex;
                const isCurrent = i === stepIndex;
                const isLast    = i === STEPS.length - 1;
                return (
                  <React.Fragment key={step}>
                    <View style={{ alignItems: 'center', flex: isLast ? 0 : undefined }}>
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isCurrent ? C.amber : done ? C.success + '30' : C.bgElevated,
                        borderWidth: isCurrent ? 0 : done ? 1.5 : 1,
                        borderColor: isCurrent ? 'transparent' : done ? C.success : C.border,
                        shadowColor: isCurrent ? C.amber : 'transparent',
                        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: isCurrent ? 5 : 0,
                      }}>
                        <Ionicons
                          name={(done ? (isCurrent ? STEP_ICONS[step] : 'checkmark') : STEP_ICONS[step]) as any}
                          size={isCurrent ? 17 : 14}
                          color={isCurrent ? '#fff' : done ? C.success : C.textDisabled}
                        />
                      </View>
                      <Text style={{
                        fontSize: 9, marginTop: 6, textAlign: 'center', width: 52,
                        color: isCurrent ? C.amber : done ? C.success : C.textDisabled,
                        fontWeight: isCurrent ? '800' : done ? '600' : '400',
                        fontFamily: F.base,
                      }} numberOfLines={2}>
                        {STEP_LABELS[step]}
                      </Text>
                    </View>
                    {!isLast && (
                      <View style={{ flex: 1, height: 2, marginTop: 17, backgroundColor: i < stepIndex ? C.success : C.border, borderRadius: 1 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: C.error + '15', borderRadius: R.md, padding: S.md, marginBottom: S.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.error + '40' }}>
            <Ionicons name="close-circle" size={28} color={C.error} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.error, fontFamily: F.base }}>Pedido Cancelado</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, fontFamily: F.base }}>Este orçamento foi cancelado.</Text>
            </View>
          </View>
        )}

        {/* ── Service Info ── */}
        <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 14, fontFamily: F.base }}>Informações do Serviço</Text>
          {[
            { icon: SERVICE_ICONS[budget.serviceType] || 'brush', label: 'Tipo',      value: SERVICE_LABELS[budget.serviceType],              color: iconColor       },
            { icon: 'document-text-outline',                       label: 'Descrição', value: budget.description,                              color: C.textSecondary },
            ...(budget.phone ? [{ icon: 'call-outline', label: 'Celular', value: budget.phone, color: C.success }] : []),
            { icon: 'location-outline', label: 'Endereço', value: `${budget.address.street}, ${budget.address.city} - ${budget.address.state}`, color: C.textSecondary },
            { icon: 'calendar-outline', label: 'Criado em', value: formatDate(budget.createdAt), color: C.textSecondary },
            ...(budget.scheduledDate ? [{ icon: 'time-outline', label: 'Agendado para', value: formatDate(budget.scheduledDate), color: C.success }] : []),
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={row.icon as any} size={17} color={row.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: C.textDisabled, fontWeight: '600', marginBottom: 2, letterSpacing: 0.5, fontFamily: F.base }}>{row.label}</Text>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '500', fontFamily: F.base }}>{row.value}</Text>
              </View>
            </View>
          ))}
          {isAdmin && budget.client && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person-outline" size={17} color={C.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: C.textDisabled, fontWeight: '600', marginBottom: 2, letterSpacing: 0.5, fontFamily: F.base }}>Cliente</Text>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '500', fontFamily: F.base }}>{budget.client.name}</Text>
                <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.base }}>{budget.client.email}</Text>
                {budget.client.phone && <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.base }}>{budget.client.phone}</Text>}
              </View>
            </View>
          )}
        </View>

        {/* ── Photos ── */}
        <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, fontFamily: F.base }}>Fotos do Ambiente</Text>
            <Text style={{ fontSize: 12, color: C.textDisabled, fontFamily: F.base }}>{budget.photos?.length || 0} foto(s)</Text>
          </View>
          {budget.photos?.length > 0 ? (
            <>
              {/* Main photo — tap to open lightbox */}
              <TouchableOpacity activeOpacity={0.9} onPress={() => { setPhotoIndex(photoIndex); setLightboxOpen(true); }}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: budget.photos[photoIndex].url }}
                    style={{ width: '100%', height: 220, borderRadius: R.md, marginBottom: 10, backgroundColor: C.bgElevated }}
                    resizeMode="cover"
                  />
                  {/* Expand hint */}
                  <View style={{
                    position: 'absolute', bottom: 18, right: 10,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    borderRadius: R.full, padding: 7,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                  }}>
                    <Ionicons name="expand-outline" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Thumbnails */}
              {budget.photos.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {budget.photos.map((p, i) => (
                    <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)} style={{ marginRight: 8 }}>
                      <Image
                        source={{ uri: p.url }}
                        style={{ width: 64, height: 64, borderRadius: R.sm, borderWidth: 2, borderColor: i === photoIndex ? C.amber : C.border, backgroundColor: C.bgElevated }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={{ height: 100, backgroundColor: C.bgElevated, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name="images-outline" size={28} color={C.textDisabled} />
              <Text style={{ fontSize: 13, color: C.textDisabled, fontFamily: F.base }}>Nenhuma foto enviada</Text>
            </View>
          )}
        </View>

        {/* ── Rating ── */}
        {budget.rating && (
          <View style={{ backgroundColor: C.bgSurface, borderRadius: R.lg, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginBottom: 12, fontFamily: F.base }}>Avaliação do Cliente</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8, gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name={s <= budget.rating!.stars ? 'star' : 'star-outline'} size={24} color={C.amber} />
              ))}
            </View>
            {budget.rating.comment ? (
              <Text style={{ fontSize: 14, color: C.textSecondary, fontStyle: 'italic', fontFamily: F.base }}>"{budget.rating.comment}"</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* ── Photo Lightbox ── */}
      <PhotoLightbox
        photos={budget.photos || []}
        index={photoIndex}
        visible={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ── Quote Modal ── */}
      <Modal visible={quoteModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: C.bgSurface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.lg, paddingBottom: 44, borderTopWidth: 1, borderColor: C.border }}>
            <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary, marginBottom: 4, fontFamily: F.base }}>Enviar Orçamento</Text>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, fontFamily: F.base }}>Informe o valor e data para o cliente aprovar.</Text>
            <ModalInput label="Valor do Orçamento (R$)" icon="cash-outline" placeholder="Ex: 2500.00" value={quotePrice} onChangeText={setQuotePrice} keyboardType="decimal-pad" />
            <ModalInput label="Data Prevista (opcional)" icon="calendar-outline" placeholder="DD/MM/AAAA" value={quoteDate} onChangeText={setQuoteDate} />
            <TouchableOpacity onPress={handleQuoteSubmit} activeOpacity={0.85}>
              <LinearGradient colors={[C.amberDeep, C.amber]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: R.md, paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: F.base }}>Enviar Orçamento ao Cliente</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQuoteModal(false)} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: C.textDisabled, fontSize: 14, fontFamily: F.base }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Rating Modal ── */}
      <Modal visible={ratingModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: C.bgSurface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.lg, paddingBottom: 44, borderTopWidth: 1, borderColor: C.border }}>
            <View style={{ width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary, marginBottom: 4, fontFamily: F.base }}>Avaliar Serviço</Text>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, fontFamily: F.base }}>Como foi sua experiência?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRatingStars(s)}>
                  <Ionicons name={s <= ratingStars ? 'star' : 'star-outline'} size={42} color={C.amber} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: F.base }}>Comentário (opcional)</Text>
            <View style={{ backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: 14, marginBottom: 24 }}>
              <TextInput
                style={{ fontSize: 14, color: C.textPrimary, minHeight: 80, textAlignVertical: 'top', paddingVertical: 10, fontFamily: F.base }}
                placeholder="Conte como foi o serviço..."
                placeholderTextColor={C.textDisabled}
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
              />
            </View>
            <TouchableOpacity onPress={handleRatingSubmit} disabled={submittingRating} activeOpacity={0.85}>
              <LinearGradient colors={[C.amberDeep, C.amber]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: R.md, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {submittingRating ? <ActivityIndicator color="#fff" /> : <Ionicons name="star" size={18} color="#fff" />}
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: F.base }}>Enviar Avaliação</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRatingModal(false)} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: C.textDisabled, fontSize: 14, fontFamily: F.base }}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
