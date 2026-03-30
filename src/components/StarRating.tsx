import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface Props {
  rating: number;
  maxStars?: number;
  onRate?: (star: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ rating, maxStars = 5, onRate, size = 20, readonly = false }: Props) {
  return (
    <View className="flex-row">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < rating;
        const star = <Text style={{ fontSize: size, color: filled ? '#F59E0B' : '#D1D5DB' }}>★</Text>;
        if (readonly || !onRate) return <View key={i}>{star}</View>;
        return (
          <TouchableOpacity key={i} onPress={() => onRate(i + 1)}>
            {star}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
