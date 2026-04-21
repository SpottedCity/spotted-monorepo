import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
  Keyboard,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { SIZES } from '@/constants/sizes';
import CustomButton from '@/components/custom-button';
import { useCategories } from '@/hooks/useCategories';
import { apiClient } from '@/constants/api';
import { useAuth } from '@/context/auth-context';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useImagePicker } from '@/hooks/use-image-picker';
import { useLocation } from '@/hooks/useLocation';

export default function Report() {
  const { categories, loading: catLoading } = useCategories();
  const { user } = useAuth();
  const router = useRouter();
  // Zauważ, że wyciągamy clearImage, aby wyczyścić zdjęcie po udanym dodaniu
  const { imageUri, pickImage, clearImage } = useImagePicker();
  const { location } = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !categoryId) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie pola.');
      return;
    }

    if (!user?.selectedCity) {
      Alert.alert('Błąd', 'Musisz mieć wybrane miasto w profilu aby dodać zgłoszenie.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = undefined;

      if (imageUri) {
        const fileFormData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          fileFormData.append('file', blob, filename);
        } else {
          fileFormData.append('file', { uri: imageUri, name: filename, type } as any);
        }

        // POPRAWKA: Na Webie nie przekazujemy W OGÓLE obiektu headers,
        // aby przeglądarka automatycznie ustawiła poprawne "boundary" dla multipart/form-data
        const config =
          Platform.OS === 'web' ? {} : { headers: { 'Content-Type': 'multipart/form-data' } };

        try {
          const uploadRes = await apiClient.post('/uploads/image', fileFormData, config);
          finalImageUrl = uploadRes.data.url;
        } catch (e) {
          console.warn('Nie udało sie wgrać zdjęcia', e);
          Alert.alert('Błąd', 'Nie udało się wgrać zdjęcia. Sprawdź logi serwera (błąd 500).');
          setIsSubmitting(false);
          return; // Przerywamy wysyłanie zgłoszenia, jeśli zdjęcie nie przeszło
        }
      }

      await apiClient.post('/posts', {
        title,
        description,
        categoryId,
        cityId: user.selectedCity.id,
        latitude: location?.latitude ?? user.selectedCity.latitude,
        longitude: location?.longitude ?? user.selectedCity.longitude,
        imageUrl: finalImageUrl
      });

      Alert.alert('Sukces', 'Zgłoszenie zostało dodane!');
      setTitle('');
      setDescription('');
      setCategoryId('');
      clearImage();
      Keyboard.dismiss();

      // Navigate użyte do poprawnego przejścia między zakładkami
      setTimeout(() => {
        router.navigate('/home');
      }, 100);
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się dodać zgłoszenia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.surface, Colors.background, Colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Dodaj zgłoszenie</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tytuł</Text>
            <TextInput
              style={styles.input}
              placeholder="Krótki opisz problemu..."
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kategoria</Text>
            {catLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.categoryBadge,
                      categoryId === cat.id && styles.categoryBadgeSelected
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        categoryId === cat.id && { color: Colors.white }
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Podaj więcej szczegółów..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Zdjęcie</Text>
            <Pressable style={styles.imagePicker} onPress={() => pickImage(false)}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={32} color={Colors.textMuted} />
                  <Text style={styles.imagePlaceholderText}>Dodaj zdjęcie</Text>
                </View>
              )}
            </Pressable>
          </View>

          <CustomButton
            title="Dodaj zgłoszenie"
            iconName="plus"
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SIZES.lg },
  header: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SIZES.xl
  },
  inputContainer: { marginBottom: SIZES.lg },
  label: {
    fontSize: SIZES.body_md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SIZES.xs
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: SIZES.radius_md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.body_lg,
    color: Colors.primary
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs
  },
  categoryBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: Colors.white,
    borderRadius: SIZES.radius_pill,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: SIZES.sm,
    marginRight: SIZES.sm
  },
  categoryBadgeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: '600'
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: SIZES.radius_lg,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  imagePlaceholder: {
    alignItems: 'center'
  },
  imagePlaceholderText: {
    marginTop: SIZES.sm,
    color: Colors.textMuted,
    fontSize: SIZES.body_sm
  }
});
