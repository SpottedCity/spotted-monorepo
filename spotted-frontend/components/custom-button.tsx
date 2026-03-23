import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof FontAwesome.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  iconName,
  variant = 'primary',
  style,
  disabled = false
}: CustomButtonProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const iconColor = variant === 'primary' ? Colors.white : Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.baseContainer,
        getContainerStyle(),
        style,
        disabled && styles.disabledContainer,
        pressed && !disabled && styles.pressed
      ]}
    >
      <View style={styles.contentWrapper}>
        {iconName && (
          <FontAwesome name={iconName} size={20} color={iconColor} style={styles.icon} />
        )}
        <Text style={[styles.baseText, getTextStyle()]}>{title}</Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  baseContainer: {
    width: '100%',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius_md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  baseText: {
    fontSize: SIZES.body_lg,
    fontWeight: 'bold'
  },
  icon: {
    marginRight: SIZES.sm
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabledContainer: {
    opacity: 0.5
  },
  primaryContainer: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  primaryText: {
    color: Colors.white
  },
  secondaryContainer: {
    backgroundColor: Colors.transparent,
    paddingVertical: SIZES.sm
  },
  secondaryText: {
    color: Colors.textMuted
  },
  outlineContainer: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary
  },
  outlineText: {
    color: Colors.primary
  }
});
