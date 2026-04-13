import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

interface Props {
  rating: number;
  maxStars?: number;
  onRate?: (star: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ rating, maxStars = 5, onRate, size = 20, readonly = false }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < rating;
        const icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? C.amber : C.textDisabled}
          />
        );
        if (readonly || !onRate) return <View key={i}>{icon}</View>;
        return (
          <TouchableOpacity key={i} onPress={() => onRate(i + 1)} activeOpacity={0.7}>
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
