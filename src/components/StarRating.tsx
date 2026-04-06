import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
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
        const star = (
          <Text style={{ fontSize: size, color: filled ? C.amber : C.textDisabled }}>★</Text>
        );
        if (readonly || !onRate) return <View key={i}>{star}</View>;
        return (
          <TouchableOpacity key={i} onPress={() => onRate(i + 1)} activeOpacity={0.7}>
            {star}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
