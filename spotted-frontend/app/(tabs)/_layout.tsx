import { IconSymbol } from '@/components/ui/icon-symbol';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const TAB_WIDTH = SIZES.width / 3;

function MyCustomTabBar({ state, descriptors, navigation }: any) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(state.index * TAB_WIDTH) }]
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* Animowane "szkiełko" */}
        {/* Using a standard View with rgba instead of Expo's BlurView. 
        BlurView combined with animations and border-radius can cause rectangular rendering artifacts on Android/Web. 
        */}
        <Animated.View style={[styles.sliderContainer, animatedStyle]}>
          <View style={styles.sliderPill} />
        </Animated.View>

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Pobieramy nazwę z opcji (np. title: 'Mapa') lub używamy nazwy pliku
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName =
            route.name === 'home'
              ? 'map.fill'
              : route.name === 'report'
                ? 'plus.circle.fill'
                : 'person.fill';

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              <IconSymbol
                name={iconName as any}
                size={24}
                color={isFocused ? Colors.accent : '#888'}
              />
              {/* DODAJEMY TEKST PONIŻEJ */}
              <Animated.Text style={[styles.label, { color: isFocused ? Colors.accent : '#888' }]}>
                {label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <MyCustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {/* tutaj można zmieniać nazwy pod ikonami */}
      <Tabs.Screen name="home" options={{ title: 'Mapa' }} />{' '}
      <Tabs.Screen name="report" options={{ title: 'Zgłoś' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Przyklejony do samego dołu ekranu, żeby nie był oderwany
    left: 0, // left i right też żeby nie były odklejone
    right: 0,
    height: SIZES.bottom_tab_height, // Wyższy na iOS przez "home indicator"
    backgroundColor: 'transparent'
  },
  background: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    // zaokrąglone tylko górne rogi
    borderTopLeftRadius: SIZES.radius_xl,
    borderTopRightRadius: SIZES.radius_xl,
    height: '100%',
    width: '100%',
    alignItems: 'flex-start', // ikony wyrównane do góry paska
    paddingTop: SIZES.sm,
    overflow: 'hidden'
  },
  sliderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: Platform.OS === 'ios' ? 65 : SIZES.bottom_tab_height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blur: {
    ...StyleSheet.absoluteFillObject
  },
  sliderPill: {
    width: TAB_WIDTH - SIZES.xl,
    height: 48,
    borderRadius: SIZES.radius_pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  tabItem: {
    flex: 1,
    height: 48, // Stała wysokość kontenera ikony
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    alignItems: 'center'
  }
});
