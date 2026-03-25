import CustomButton from '@/components/custom-button';
import ProgressBar from '@/components/progress-bar';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import { mockCurrentUser } from '@/constants/user-data';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '@/hooks/use-image-picker';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'expo-router';
import AvatarProgress from '@/components/avatar-progress';

export default function Profile() {
  const { imageUri, pickImage } = useImagePicker();
  const [apiError, setApiError] = useState('');

  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    setApiError('');

    try {
      console.log('Log out');
      await logout();

      router.replace('/login');
    } catch (error: any) {
      console.log('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
        style={styles.container}
      >
        {/* ScrollView for smaller devices */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profil Image Container */}
          <View style={styles.profileImageContainer}>
            <AvatarProgress
              imageUrl={user?.avatar}
              currentPoints={mockCurrentUser.reputationScore}
              maxPoints={2000}
              onEditPress={() => pickImage(true)}
            />

            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.firstName || 'Nowy Użytkownik'}</Text>
              <Pressable onPress={() => console.log('Edycja nicku')} style={styles.nameEditBtn}>
                <Feather name="edit-2" size={SIZES.icon_sm} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.role}>
              Lokalny Strażnik • {mockCurrentUser.reputationScore} / 2000 pkt
            </Text>
          </View>

          {/* STATS CARD */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockCurrentUser.stats.reportsAdded}</Text>
              <Text style={styles.statLabel}>Zgłoszenia</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockCurrentUser.stats.upvotesReceived}</Text>
              <Text style={styles.statLabel}>Otrzymane 👍</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockCurrentUser.stats.commentsAdded}</Text>
              <Text style={styles.statLabel}>Komentarze</Text>
            </View>
          </View>

          {/* MENU CARD */}
          <View style={styles.menuCard}>
            {/* CITY */}
            <Pressable style={styles.menuItem} onPress={() => console.log('zmiana miasta')}>
              <View style={styles.menuItemLeft}>
                <Feather name="map-pin" size={SIZES.icon_md} color={Colors.primary} />
                <Text style={styles.menuItemLabel}>Moje miasto</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{mockCurrentUser.city}</Text>
                <Feather name="chevron-right" size={SIZES.icon_sm} color={Colors.textMuted} />
              </View>
            </Pressable>
            <View style={styles.menuDivider} />
            {/* REMINDER */}
            <Pressable
              style={styles.menuItem}
              onPress={() => console.log('Ustawienia powiadomień')}
            >
              <View style={styles.menuItemLeft}>
                <Feather name="bell" size={SIZES.icon_md} color={Colors.primary} />
                <Text style={styles.menuItemLabel}>Powiadomienia</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Włączone</Text>
                <Feather name="chevron-right" size={SIZES.icon_sm} color={Colors.textMuted} />
              </View>
            </Pressable>

            <View style={styles.menuDivider} />

            {/* EMAIL */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Feather name="mail" size={SIZES.icon_md} color={Colors.textMuted} />
                <Text style={[styles.menuItemLabel, { color: Colors.textMuted }]}>E-mail</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: Colors.textMuted }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* LOG OUT  */}
          <View style={styles.buttonContainer}>
            <CustomButton title="Wyloguj się" onPress={handleLogOut} iconName="sign-out" />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: SIZES.lg,
    marginBottom: SIZES.xl
  },
  imageWrapper: {
    position: 'relative'
  },
  profileImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.white
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 34,
    width: 34,
    backgroundColor: Colors.accent,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white
  },
  nameRoleContainer: {
    alignItems: 'center',
    marginVertical: SIZES.md
  },
  name: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: Colors.primary
  },
  role: {
    fontSize: SIZES.body_sm,
    color: '#64748B',
    fontWeight: '500',
    marginTop: SIZES.xs
  },
  inputFieldsContainer: {
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: SIZES.bottom_tab_height
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md
  },
  nameEditBtn: {
    marginLeft: SIZES.sm,
    padding: SIZES.xs
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: SIZES.radius_lg,
    paddingVertical: SIZES.md,
    marginBottom: SIZES.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2
  },
  statLabel: {
    fontSize: SIZES.tiny,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: SIZES.sm
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    marginBottom: SIZES.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemLabel: {
    fontSize: SIZES.body_md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: SIZES.sm
  },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  menuItemValue: { fontSize: SIZES.body_sm, color: Colors.textMuted, marginRight: SIZES.xs },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginLeft: SIZES.xl + SIZES.md }
});
