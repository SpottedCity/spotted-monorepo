import { apiClient } from '@/constants/api';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

interface City {
  id: string;
  name: string;
  voivodeship: string;
}

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (cityId: string) => Promise<void>;
}

export default function CityPickerModal({ visible, onClose, onSelectCity }: CityPickerModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && cities.length === 0) fetchCities();
  }, [visible]);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<City[]>('/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Błąd pobierania miast: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.voivodeship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = async (cityId: string) => {
    setIsSaving(true);
    await onSelectCity(cityId);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Wybierz miasto</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Wyszukiwarka */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj miasta lub województwa..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Lista miast */}
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.cityItem}
                  onPress={() => handleSelect(item.id)}
                  disabled={isSaving}
                >
                  <View>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityVoivodeship}>{item.voivodeship}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={Colors.textMuted} />
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nie znaleziono takiego miasta.</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: SIZES.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md
  },
  title: { fontSize: SIZES.h3, fontWeight: 'bold', color: Colors.primary },
  closeBtn: { padding: SIZES.xs },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: SIZES.radius_md,
    paddingHorizontal: SIZES.sm,
    marginBottom: SIZES.md
  },
  searchIcon: { marginRight: SIZES.xs },
  searchInput: { flex: 1, height: 45, color: Colors.textMuted },
  listContainer: { paddingBottom: SIZES.xxl },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  cityName: { fontSize: SIZES.body_md, fontWeight: '600', color: Colors.textMuted },
  cityVoivodeship: { fontSize: SIZES.body_sm, color: Colors.textMuted, marginTop: 2 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: SIZES.xl }
});
