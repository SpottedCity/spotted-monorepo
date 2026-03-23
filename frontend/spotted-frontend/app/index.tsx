import CustomButton from '@/components/custom-button';
import OnboardingSlide from '@/components/onboarding-slide';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEB_MAX_WIDTH = 1920;

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth =
    Platform.OS === 'web' && windowWidth > WEB_MAX_WIDTH ? WEB_MAX_WIDTH : windowWidth;

  const onboardingData = [
    {
      id: '1',
      title: 'W czym pomoże mi aplikacja?',
      text: 'Omijaj korki i dowiaduj się o awariach w Twoim mieście.',
      animationSource: require('../assets/onboarding/Thinking2.json')
    },
    {
      id: '2',
      title: 'Widzisz problem? \n Zgłoś go!',
      text: 'Dziura w drodze, wypadek czy opóźniony autobus? Wystarczy kilka kliknięć, aby ostrzec innych.',
      animationSource: require('../assets/onboarding/Alert.json')
    },
    {
      id: '3',
      title: 'Pomagajmy sobie nawzajem',
      text: 'Razem tworzymy bezpieczniejsze miasto. Twoje zgłoszenie może uratować komuś dzień.',
      animationSource: require('../assets/onboarding/Team.json')
    },
    {
      id: '4',
      title: 'Zobacz, co dzieje się obok',
      text: 'Abyśmy mogli pokazać Ci najświeższe zgłoszenia z okolicy oraz dodać twoje, potrzebujemy dostępu do lokalizacji.',
      animationSource: require('../assets/onboarding/Location.json')
    }
  ];

  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('@viewedOnboarding');
        if (value != null) {
          router.replace('/login');
        }
      } catch (error) {
        console.log('Błąd podczas sprawdzania onboardingu: ', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkOnboarding();
  }, [router]);

  const slideToNext = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@viewedOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.log('Błąd zapisu flagi:', error);
    }
  };

  if (isChecking) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.webContainer}>
          <View style={styles.sliderSection}>
            <FlatList
              ref={flatListRef}
              data={onboardingData}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(data, index) => ({
                length: slideWidth,
                offset: slideWidth * index,
                index
              })}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
                setCurrentIndex(index);
              }}
              renderItem={({ item }) => (
                <OnboardingSlide
                  title={item.title}
                  text={item.text}
                  animationSource={item.animationSource}
                  width={slideWidth}
                />
              )}
            />
          </View>

          <View style={styles.buttonContainer}>
            {currentIndex > 0 && currentIndex < 3 && (
              <CustomButton
                variant="secondary"
                title="Cofnij"
                onPress={() => slideToNext(currentIndex - 1)}
              />
            )}

            {currentIndex < 3 && (
              <View style={styles.primaryButtonWrapper}>
                <CustomButton title="Dalej" onPress={() => slideToNext(currentIndex + 1)} />
              </View>
            )}

            {currentIndex === 3 && (
              <>
                <CustomButton
                  variant="secondary"
                  title="Cofnij"
                  onPress={() => slideToNext(currentIndex - 1)}
                />
                <View style={styles.primaryButtonWrapper}>
                  <CustomButton title="Stwórz konto!" onPress={finishOnboarding} />
                </View>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webContainer: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: WEB_MAX_WIDTH
  },
  sliderSection: {
    flex: 1
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: SIZES.xxl,
    paddingTop: SIZES.sm,
    minHeight: 160,
    justifyContent: 'flex-end'
  },
  primaryButtonWrapper: {
    width: '80%',
    maxWidth: 300,
    marginTop: SIZES.sm
  }
});
