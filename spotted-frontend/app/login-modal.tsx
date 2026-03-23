import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Import stałych kolorów z pliku theme.ts
import { Colors } from '@/constants/theme';

// Ikony
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SIZES } from '@/constants/sizes';

// Ten ekran jest wyświetlany jako modal, gdy użytkownik próbuje uzyskać dostęp do funkcji
// wymagającej autoryzacji bez zalogowania się
// localhost:8081/login-modal
export default function ModalScreen() {
  return (
    <LinearGradient
      colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
      style={styles.container}
    >
      {/* Główny kontener*/}
      <View style={styles.innerContainer}>
        <AntDesign name="lock" size={100} color={Colors.accent} style={styles.iconLock} />

        <Text style={styles.title}>Operacja wymaga autoryzacji!</Text>

        <Text style={styles.subtitle}>zaloguj lub zarejestruj się poniżej</Text>

        <View style={styles.linkContainer}>
          <Link href="/login" dismissTo style={styles.link}>
            <View style={styles.contentWrapper}>
              <Entypo name="login" size={24} color={Colors.white} style={styles.iconLogin} />
              <Text style={styles.linkText}>Zaloguj się</Text>
            </View>
          </Link>

          <Link href="/register" dismissTo style={styles.link}>
            <View style={styles.contentWrapper}>
              <MaterialCommunityIcons
                name="account-box-edit-outline"
                size={24}
                color={Colors.white}
                style={styles.iconLogin}
              />
              <Text style={styles.linkText}>Zarejestruj się</Text>
            </View>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1 // Rozciąga gradient na cały ekran
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.lg,
    backgroundColor: 'transparent'
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: SIZES.body_lg,
    color: Colors.textMuted,
    marginTop: SIZES.sm,
    textAlign: 'center'
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: SIZES.xxl,
    gap: SIZES.md
  },
  link: {
    width: 165,
    backgroundColor: Colors.primary,
    borderRadius: SIZES.radius_md,
    padding: SIZES.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  linkText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: SIZES.body_md
  },
  iconLock: {
    marginBottom: SIZES.xxl
  },
  iconLogin: {
    marginRight: SIZES.sm
  }
});
