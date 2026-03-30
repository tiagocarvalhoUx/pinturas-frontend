import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../store/appStore';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate } from '../utils/helpers';

interface Props {
  budget: Budget;
  onPress: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  internal: 'home', external: 'business', texture: 'color-palette',
  lacquering: 'sparkles', waterproofing: 'water', restoration: 'construct',
};

const SERVICE_BG: Record<string, string> = {
  internal: '#eff6ff', external: '#f5f3ff', texture: '#fffbeb',
  lacquering: '#fef2f2', waterproofing: '#ecfeff', restoration: '#f0fdf4',
};

const SERVICE_COLOR: Record<string, string> = {
  internal: '#2563EB', external: '#7c3aed', texture: '#d97706',
  lacquering: '#dc2626', waterproofing: '#0891b2', restoration: '#059669',
};

export function BudgetCard({ budget, onPress }: Props) {
  const statusColor = STATUS_COLORS[budget.status] || '#6b7280';
  const price = budget.finalPrice ?? budget.estimatedPrice;
  const icon = SERVICE_ICONS[budget.serviceType] || 'brush';
  const iconBg = SERVICE_BG[budget.serviceType] || '#eff6ff';
  const iconColor = SERVICE_COLOR[budget.serviceType] || '#2563EB';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Icon */}
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
              {SERVICE_LABELS[budget.serviceType] || budget.serviceType}
            </Text>
            <View style={{ backgroundColor: statusColor + '18', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>
                {STATUS_LABELS[budget.status]}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <Ionicons name="location-outline" size={12} color="#94a3b8" />
            <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1}>
              {budget.address.city}, {budget.address.state}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="resize-outline" size={12} color="#94a3b8" />
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{budget.area} m²</Text>
            </View>
            {price ? (
              <Text style={{ fontSize: 14, fontWeight: '700', color: iconColor }}>
                {formatCurrency(price)}
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Aguardando valor</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      </View>

      {/* Footer */}
      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(budget.createdAt)}</Text>
        {budget.photos?.length > 0 && (
          <>
            <Text style={{ color: '#e2e8f0', marginHorizontal: 4 }}>•</Text>
            <Ionicons name="images-outline" size={12} color="#94a3b8" />
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>{budget.photos.length} foto{budget.photos.length > 1 ? 's' : ''}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
