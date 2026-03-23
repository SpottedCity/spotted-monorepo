import CustomButton from '@/components/custom-button';
import GoogleSignInButton from '@/components/google-sign-in-button';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const router = useRouter();

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');
    setUsernameError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError('Adres e-mail jest wymagany.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Wpisz poprawny adres e-mail.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Hasło jest wymagane.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Hasło musi mieć co najmniej 6 znaków');
      isValid = false;
    }

    {
      /*
       * TODO When there is a backend, we will add name checking
       */
    }
    if (!username) {
      setUsernameError('Nazwa użytkownika jest wymagana / zajęta');
      isValid = false;
    }

    return isValid;
  };

  const handleRegisterMock = () => {
    if (!validateForm()) {
      return;
    }
    console.log('logowanie emailem: ${email, hasło: ${password}');
    router.replace('/(tabs)/home');
  };
  const handleGoogleRegister = () => {
    router.replace('/(tabs)/home');
  };

  const handleLoginButton = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topSection}>
              <View style={styles.header}>
                <Text style={styles.title}>Witamy nowego użytkownika!</Text>
                <Text style={styles.subtitle}>
                  Zarejestruj się, aby dodawać zgłoszenia i pomoagać innym.
                </Text>
              </View>
              <View style={styles.form}>
                <Text style={styles.inputLabel}>Nazwa Użytkownika</Text>
                <TextInput
                  style={[styles.input, usernameError ? styles.inputError : null]}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
                <Text style={styles.inputLabel}>Adres e-mail</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <Text style={styles.inputLabel}>Hasło</Text>
                <TextInput
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
            </View>
            <View style={styles.bottomSection}>
              <CustomButton title="Zarejestruj się" iconName="user" onPress={handleRegisterMock} />
              <GoogleSignInButton onPress={handleGoogleRegister} />

              <View style={styles.registerPrompt}>
                <Text style={styles.registerText}>Masz już konto? </Text>
                <Text style={styles.registerText} onPress={handleLoginButton}>
                  Zaloguj się
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%'
  },
  topSection: {
    flex: 1,
    justifyContent: 'center'
  },
  bottomSection: {
    marginTop: SIZES.lg
  },
  header: {
    marginBottom: SIZES.xxl
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: SIZES.sm
  },
  subtitle: {
    fontSize: SIZES.body_lg,
    color: Colors.textMuted,
    lineHeight: 24
  },
  form: {
    width: '100%'
  },
  inputLabel: {
    fontSize: SIZES.body_md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.xs
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: SIZES.radius_md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.body_lg,
    color: Colors.primary,
    marginBottom: SIZES.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5
  },
  errorText: {
    color: Colors.error,
    fontSize: SIZES.body_sm,
    marginTop: -SIZES.md,
    marginBottom: SIZES.md,
    marginLeft: SIZES.xs
  },
  forgotPassword: {
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -SIZES.sm,
    marginBottom: SIZES.xl
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border
  },
  dividerText: {
    marginHorizontal: SIZES.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: SIZES.body_md
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.lg
  },
  registerText: {
    color: Colors.textMuted,
    fontSize: SIZES.body_lg
  },
  registerLink: {
    color: Colors.primary,
    fontSize: SIZES.body_lg,
    fontWeight: 'bold'
  }
});
