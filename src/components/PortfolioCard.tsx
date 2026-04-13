import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioItem } from '../store/appStore';
import { SERVICE_LABELS } from '../utils/helpers';
import { C, R, F } from '../theme';

interface Props {
  item: PortfolioItem;
  onPress: () => void;
}

export function PortfolioCard({ item, onPress }: Props) {
  const [showAfter, setShowAfter] = useState(true);
  const image = showAfter ? item.afterImage : item.beforeImage;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: C.bgSurface,
        borderRadius: R.lg, overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1, borderColor: C.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
      }}
    >
      {/* Image */}
      <View style={{ position: 'relative', height: 190 }}>
        {image?.url ? (
          <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{
            width: '100%', height: '100%',
            backgroundColor: C.bgElevated,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: R.lg,
              backgroundColor: C.amber + '18',
              borderWidth: 1, borderColor: C.amber + '30',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="image-outline" size={32} color={C.amber} />
            </View>
            <Text style={{ color: C.textDisabled, fontSize: 12, marginTop: 10, fontFamily: F.base }}>
              Sem imagem
            </Text>
          </View>
        )}

        {/* Before/After toggle */}
        {item.beforeImage?.url && item.afterImage?.url && (
          <View style={{
            position: 'absolute', top: 10, right: 10,
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.65)',
            borderRadius: R.full, padding: 3,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <TouchableOpacity
              onPress={() => setShowAfter(false)}
              style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full,
                backgroundColor: !showAfter ? C.amber : 'transparent',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: !showAfter ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily: F.base }}>
                Antes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAfter(true)}
              style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full,
                backgroundColor: showAfter ? C.amber : 'transparent',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: showAfter ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily: F.base }}>
                Depois
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured badge */}
        {item.featured && (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: C.amber,
            borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4,
            flexDirection: 'row', alignItems: 'center', gap: 4,
          }}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', fontFamily: F.base }}>Destaque</Text>
          </View>
        )}

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
          }}
        />
      </View>

      {/* Info */}
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 3, fontFamily: F.base }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: C.amber, marginBottom: 8, fontWeight: '600', fontFamily: F.base }}>
          {SERVICE_LABELS[item.serviceType]}
        </Text>
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {item.area && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="expand-outline" size={12} color={C.textDisabled} />
              <Text style={{ fontSize: 11, color: C.textSecondary, fontFamily: F.base }}>{item.area} m²</Text>
            </View>
          )}
          {item.duration && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={12} color={C.textDisabled} />
              <Text style={{ fontSize: 11, color: C.textSecondary, fontFamily: F.base }}>{item.duration}</Text>
            </View>
          )}
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location-outline" size={12} color={C.textDisabled} />
              <Text style={{ fontSize: 11, color: C.textSecondary, fontFamily: F.base }}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
