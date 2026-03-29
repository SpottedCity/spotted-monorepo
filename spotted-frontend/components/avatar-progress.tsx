import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface AvatarProgressProps {
  imageUrl?: string | null;
  currentPoints: number;
  maxPoints: number;
  size?: number;
  strokeWidth?: number;
  onEditPress: () => void;
}

export default function AvatarProgress({
  imageUrl,
  currentPoints,
  maxPoints,
  size = 140,
  strokeWidth = 8,
  onEditPress
}: AvatarProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(Math.max(currentPoints / maxPoints, 0), 1);
  const strokeDashoffset = circumference - progressPercent * circumference;

  const imageSize = size - strokeWidth * 4;

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <Image
        source={imageUrl ? { uri: imageUrl } : require('@/assets/images/pfp.jpg')}
        style={[styles.image, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
      />

      <Pressable style={styles.editIconContainer} onPress={onEditPress}>
        <Feather name="camera" size={SIZES.icon_sm} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  image: {
    borderWidth: 2,
    borderColor: Colors.surface
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    height: 36,
    width: 36,
    backgroundColor: Colors.accent,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white
  }
});
