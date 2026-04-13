import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, F } from '../theme';

interface Service {
  id: string;
  name: string;
  description: string;
  pricePerM2: number;
  color: string;
  icon: string;
  duration: string;
}

interface Props {
  service: Service;
  onPress: () => void;
}

const ICON_MAP: Record<string, string> = {
  home:     'home',
  building: 'business',
  layers:   'color-palette',
  sparkles: 'sparkles',
  droplets: 'water',
  refresh:  'construct',
};

export function ServiceCard({ service, onPress }: Props) {
  const accentColor = C.amber;
  const iconName = (ICON_MAP[service.icon] || 'brush') as any;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginRight: 14, width: 180,
        backgroundColor: C.bgSurface,
        borderRadius: R.lg, overflow: 'hidden',
        borderWidth: 1.5, borderColor: accentColor + '30',
      }}
    >
      {/* Top accent line */}
      <View style={{ height: 3, backgroundColor: accentColor, opacity: 0.8 }} />

      <View style={{ padding: 14 }}>
        <View style={{
          width: 48, height: 48, borderRadius: R.md,
          backgroundColor: accentColor + '1A',
          borderWidth: 1, borderColor: accentColor + '30',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 10,
        }}>
          <Ionicons name={iconName} size={24} color={accentColor} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPrimary, marginBottom: 4, fontFamily: F.base }}>
          {service.name}
        </Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 12, lineHeight: 16, fontFamily: F.base }} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: accentColor, fontFamily: F.base }}>
            R$ {service.pricePerM2}/m²
          </Text>
          <Text style={{ fontSize: 11, color: C.textDisabled, fontFamily: F.base }}>{service.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
