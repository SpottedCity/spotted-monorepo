import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
interface CustomInputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const CustomInput = ({ label, iconName, ...props }: CustomInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputFieldContainer}>
        <Ionicons name={iconName} size={16} color={Colors.primary} style={styles.icon} />

        <TextInput style={styles.input} placeholderTextColor={'#ABABAB'} {...props} />
      </View>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  inputLabel: {
    fontWeight: '600', // React Native woli '600' niż 'semibold'
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
    marginLeft: 4
  },
  inputFieldContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: SIZES.radius_md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SIZES.md
  },
  icon: {
    marginHorizontal: SIZES.icon_md
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: Colors.primary
  }
});
