import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface Props {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({ message, size = 'large', color = '#2563EB' }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size={size} color={color} />
      {message && <Text className="mt-3 text-gray-500 text-base">{message}</Text>}
    </View>
  );
}
