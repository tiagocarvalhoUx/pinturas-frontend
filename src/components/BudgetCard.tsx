import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../store/appStore';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate } from '../utils/helpers';
import { C, R } from '../theme';

interface Props {
  budget: Budget;
  onPress: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  internal:      'home',
  external:      'business',
  texture:       'color-palette',
  lacquering:    'sparkles',
  waterproofing: 'water',
  restoration:   'construct',
};

const SERVICE_COLORS: Record<string, string> = {
  internal:      C.amber,
  external:      '#5AAAE0',
  texture:       C.terra,
  lacquering:    '#A04ABA',
  waterproofing: '#4ABA79',
  restoration:   C.amberLight,
};

export function BudgetCard({ budget, onPress }: Props) {
  const statusColor = STATUS_COLORS[budget.status] || C.textSecondary;
  const price       = budget.finalPrice ?? budget.estimatedPrice;
  const icon        = SERVICE_ICONS[budget.serviceType]  || 'brush';
  const iconColor   = SERVICE_COLORS[budget.serviceType] || C.amber;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={{
        backgroundColor: C.bgSurface,
        borderRadius: R.lg, marginBottom: 12,
        padding: 16, borderWidth: 1, borderColor: C.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18, shadowRadius: 12, elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Icon */}
        <View style={{
          width: 50, height: 50, borderRadius: R.md,
          backgroundColor: iconColor + '1A',
          borderWidth: 1, borderColor: iconColor + '30',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }} numberOfLines={1}>
              {SERVICE_LABELS[budget.serviceType] || budget.serviceType}
            </Text>
            <View style={{
              backgroundColor: statusColor + '20',
              borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3,
              borderWidth: 1, borderColor: statusColor + '40',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor }}>
                {STATUS_LABELS[budget.status]}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <Ionicons name="location-outline" size={12} color={C.textDisabled} />
            <Text style={{ fontSize: 12, color: C.textSecondary }} numberOfLines={1}>
              {budget.address.city}, {budget.address.state}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="resize-outline" size={12} color={C.textDisabled} />
              <Text style={{ fontSize: 12, color: C.textSecondary }}>{budget.area} m²</Text>
            </View>
            {price ? (
              <Text style={{ fontSize: 14, fontWeight: '800', color: iconColor }}>
                {formatCurrency(price)}
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: C.textDisabled, fontStyle: 'italic' }}>Aguardando valor</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={C.textDisabled} />
      </View>

      {/* Footer divider */}
      <View style={{
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: C.border,
        flexDirection: 'row', alignItems: 'center', gap: 4,
      }}>
        <Ionicons name="calendar-outline" size={12} color={C.textDisabled} />
        <Text style={{ fontSize: 11, color: C.textDisabled }}>{formatDate(budget.createdAt)}</Text>
        {budget.photos?.length > 0 && (
          <>
            <Text style={{ color: C.border, marginHorizontal: 4 }}>•</Text>
            <Ionicons name="images-outline" size={12} color={C.textDisabled} />
            <Text style={{ fontSize: 11, color: C.textDisabled }}>
              {budget.photos.length} foto{budget.photos.length > 1 ? 's' : ''}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
