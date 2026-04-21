import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  Modal, Dimensions, Animated, StatusBar, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioItem } from '../store/appStore';
import { SERVICE_LABELS } from '../utils/helpers';
import { C, R, S, F } from '../theme';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  item: PortfolioItem;
  onBack: () => void;
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  images, initialIndex, visible, onClose,
}: {
  images: { url: string; label: string }[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) {
  const [index, setIndex]     = useState(initialIndex);
  const opacity               = useRef(new Animated.Value(0)).current;
  const imgScale              = useRef(new Animated.Value(0.88)).current;
  const translateY            = useRef(new Animated.Value(0)).current;

  useEffect(() => { setIndex(initialIndex); }, [initialIndex]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(imgScale, { toValue: 1, tension: 120, friction: 10, useNativeDriver: true }),
      ]).start();
      translateY.setValue(0);
    } else {
      opacity.setValue(0);
      imgScale.setValue(0.88);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', opacity, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={onClose} style={{
          position: 'absolute', top: 52, right: 20, zIndex: 10,
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.12)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {images.length > 1 && (
          <View style={{ position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: F.base }}>
                {index + 1} / {images.length}
              </Text>
            </View>
          </View>
        )}

        <View style={{ position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
          <View style={{ backgroundColor: C.amber + 'CC', borderRadius: R.full, paddingHorizontal: 18, paddingVertical: 6 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1, fontFamily: F.base }}>
              {images[index]?.label}
            </Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: imgScale }, { translateY }] }} {...panResponder.panHandlers}>
          <Image source={{ uri: images[index]?.url }} style={{ width: W, height: H * 0.75 }} resizeMode="contain" />
        </Animated.View>

        {images.length > 1 && (
          <>
            <TouchableOpacity onPress={() => setIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
              style={{ position: 'absolute', left: 16, top: H / 2 - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
              style={{ position: 'absolute', right: 16, top: H / 2 - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {images.length > 1 && (
          <View style={{ position: 'absolute', bottom: 52, flexDirection: 'row', gap: 6 }}>
            {images.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setIndex(i)}>
                <View style={{
                  width: i === index ? 24 : 7, height: 7, borderRadius: 4,
                  backgroundColor: i === index ? C.amber : 'rgba(255,255,255,0.3)',
                }} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Tela de detalhe ─────────────────────────────────────────────────────────
export function PortfolioDetailScreen({ item, onBack }: Props) {
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const enterAnim    = useRef(new Animated.Value(30)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterAnim,    { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(enterOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const afterImages: { url: string; label: string }[] = [];
  const beforeImages: { url: string; label: string }[] = [];
  if (item.afterImage?.url)  afterImages.push({ url: item.afterImage.url,  label: 'DEPOIS' });
  if (item.beforeImage?.url) beforeImages.push({ url: item.beforeImage.url, label: 'ANTES' });
  (item.extraImages || []).forEach((img) => {
    if (img.type === 'after')  afterImages.push({ url: img.url, label: 'DEPOIS' });
    else                       beforeImages.push({ url: img.url, label: 'ANTES'  });
  });
  const images     = [...afterImages, ...beforeImages];
  const hasBefore  = !!item.beforeImage?.url;
  const hasAfter   = !!item.afterImage?.url;
  const hasBoth    = hasBefore && hasAfter;

  const serviceColor = {
    internal: C.amber, external: C.blue, texture: C.terra,
    lacquering: C.purple, waterproofing: C.green, restoration: C.amberLight,
  }[item.serviceType] || C.amber;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>

      {/* ── Header ── */}
      <View style={{
        backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: C.border,
      }}>
        <View style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: 80, backgroundColor: serviceColor, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={onBack}
            style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textSecondary, fontSize: 11, letterSpacing: 0.5, fontFamily: F.base }}>Portfólio</Text>
            <Text style={{ color: C.textPrimary, fontSize: 17, fontWeight: '800', fontFamily: F.base }} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {item.featured && (
            <View style={{ backgroundColor: C.amber, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={11} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', fontFamily: F.base }}>DESTAQUE</Text>
            </View>
          )}
        </View>
      </View>

      <Animated.ScrollView
        style={{ opacity: enterOpacity }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <Animated.View style={{ transform: [{ translateY: enterAnim }] }}>

          {/* ── Drag Slider Antes × Depois ── */}
          {hasBoth ? (
            <View>
              <View style={{
                paddingHorizontal: S.md, paddingTop: 16, paddingBottom: 8,
                flexDirection: 'row', alignItems: 'center', gap: 6,
              }}>
                <Ionicons name="swap-horizontal-outline" size={14} color={C.amber} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: C.textPrimary, letterSpacing: 0.3, fontFamily: F.base }}>
                  Comparação Antes × Depois
                </Text>
              </View>
              <BeforeAfterSlider before={item.beforeImage!.url} after={item.afterImage!.url} width={W} height={280} captureOnStart />
            </View>
          ) : (
            // Fallback: imagem simples se só tiver uma
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => { setLightboxIndex(0); setLightboxOpen(true); }}
            >
              <View style={{ height: 300, backgroundColor: C.bgElevated }}>
                {(item.afterImage?.url || item.beforeImage?.url) ? (
                  <Image
                    source={{ uri: item.afterImage?.url || item.beforeImage?.url }}
                    style={{ width: '100%', height: '100%' }} resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Ionicons name="image-outline" size={48} color={C.textDisabled} />
                    <Text style={{ color: C.textDisabled, fontSize: 13, fontFamily: F.base }}>Sem imagem</Text>
                  </View>
                )}
                {(item.afterImage?.url || item.beforeImage?.url) && (
                  <View style={{
                    position: 'absolute', bottom: 14, right: 14,
                    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: R.full, padding: 8,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                  }}>
                    <Ionicons name="expand-outline" size={18} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* ── Galeria de fotos ── */}
          {images.length > 1 && (
            <View style={{ backgroundColor: C.bgSurface, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.md, paddingTop: 12, paddingBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="images-outline" size={13} color={C.amber} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: C.textSecondary, letterSpacing: 0.5, fontFamily: F.base, textTransform: 'uppercase' }}>
                    Galeria ({images.length} fotos)
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: C.textDisabled, fontFamily: F.base }}>Toque para ampliar</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: 12, gap: 8 }}
              >
                {images.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                    activeOpacity={0.82}
                    style={{ width: 80, height: 64, borderRadius: R.sm, overflow: 'hidden', borderWidth: 2, borderColor: i === 0 ? C.amber : C.border, alignSelf: 'flex-start' }}
                  >
                    <Image source={{ uri: img.url }} style={{ width: 80, height: 64 }} resizeMode="cover" />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 3, alignItems: 'center' }}>
                      <Text style={{ color: img.label === 'DEPOIS' ? C.amber : '#fff', fontSize: 8, fontWeight: '900', fontFamily: F.base, letterSpacing: 0.8 }}>{img.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* ── Card de informações ── */}
        <View style={{ padding: S.md }}>
          <View style={{
            backgroundColor: C.bgSurface, borderRadius: R.lg,
            padding: S.md, marginBottom: S.md,
            borderWidth: 1, borderColor: C.border,
          }}>
            {/* Badge serviço */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <View style={{
                backgroundColor: serviceColor + '20', borderRadius: R.full,
                paddingHorizontal: 12, paddingVertical: 5,
                borderWidth: 1, borderColor: serviceColor + '40',
              }}>
                <Text style={{ color: serviceColor, fontSize: 12, fontWeight: '800', fontFamily: F.base }}>
                  {SERVICE_LABELS[item.serviceType]}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '900', color: C.textPrimary, marginBottom: 8, letterSpacing: -0.3, fontFamily: F.base }}>
              {item.title}
            </Text>

            {item.description && (
              <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 21, marginBottom: 16, fontFamily: F.base }}>
                {item.description}
              </Text>
            )}

            <View style={{ height: 1, backgroundColor: C.border, marginBottom: 16 }} />

            {/* Meta */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {[
                { icon: 'resize-outline',   label: 'ÁREA',     val: item.area     ? `${item.area} m²`  : null },
                { icon: 'time-outline',     label: 'DURAÇÃO',  val: item.duration || null },
                { icon: 'location-outline', label: 'LOCAL',    val: item.location || null },
              ].filter((m) => m.val).map((m) => (
                <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: R.sm,
                    backgroundColor: serviceColor + '1A', borderWidth: 1, borderColor: serviceColor + '30',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={m.icon as any} size={15} color={serviceColor} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: C.textDisabled, fontWeight: '600', letterSpacing: 0.5, fontFamily: F.base }}>{m.label}</Text>
                    <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '700', fontFamily: F.base }}>{m.val}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity activeOpacity={0.85} style={{
            backgroundColor: C.amber,
            borderRadius: R.md, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: C.amber, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}>
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, fontFamily: F.base }}>Solicitar Orçamento</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <Lightbox
        images={images}
        initialIndex={lightboxIndex}
        visible={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </View>
  );
}
