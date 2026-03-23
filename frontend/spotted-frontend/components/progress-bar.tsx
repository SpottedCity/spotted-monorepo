import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  currentPoints: number;
  maxPoints: number;
  nextRank: string;
}

const ProgressBar = ({ currentPoints, maxPoints, nextRank }: ProgressBarProps) => {
  const progressPercent = Math.min((currentPoints / maxPoints) * 100, 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercent,
      duration: 1500,
      useNativeDriver: false
    }).start();
  }, [progressPercent]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.pointsText}>
          <Text style={styles.pointsHighlight}>{currentPoints}</Text> / {maxPoints} pkt
        </Text>
        <Text style={styles.nextRankText}>Następna: {nextRank}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: SIZES.xl,
    marginTop: SIZES.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SIZES.xs
  },
  pointsText: {
    fontSize: SIZES.body_sm,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  pointsHighlight: {
    color: Colors.primary,
    fontSize: SIZES.body_lg,
    fontWeight: '900'
  },
  nextRankText: {
    fontSize: SIZES.tiny,
    color: Colors.accent,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  track: {
    height: SIZES.sm,
    backgroundColor: '#E2E8F0',
    borderRadius: SIZES.radius_pill,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: SIZES.radius_pill
  }
});

export default ProgressBar;
