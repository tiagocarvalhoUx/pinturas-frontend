import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { C, F } from '../theme';

interface Props {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({ message, size = 'large', color = C.amber }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgBase }}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={{ marginTop: 12, color: C.textSecondary, fontSize: 14, fontFamily: F.base }}>
          {message}
        </Text>
      )}
    </View>
  );
}
