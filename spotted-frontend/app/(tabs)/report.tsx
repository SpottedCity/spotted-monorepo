import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Report() {
  return (
    <LinearGradient
      colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.innerContainer}>
          <Text style={styles.text}>Zgłoszenia</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  text: {
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.primary,
    fontSize: 50
  },
  container: {
    flex: 1
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent' // przezroczyste, żeby widzieć gradient
  }
});
