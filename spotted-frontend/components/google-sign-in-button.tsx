import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '@/constants/theme';
import { SIZES } from '@/constants/sizes';

interface GoogleSignInButtonProps {
  onPress?: () => void;
}

const GoogleSignInButton = ({ onPress }: GoogleSignInButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
    >
      <View style={styles.contentWrapper}>
        <FontAwesome name="google" size={20} color={Colors.accent} style={styles.icon} />
        <Text style={styles.googleButtonText}>Kontynuuj z Google</Text>
      </View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: Colors.surface,
    width: '100%',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius_md,
    marginTop: SIZES.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }]
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    marginRight: SIZES.sm
  },
  googleButtonText: {
    color: Colors.primary,
    fontSize: SIZES.body_lg,
    fontWeight: '600'
  }
});

export default GoogleSignInButton;
