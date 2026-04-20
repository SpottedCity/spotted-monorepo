import React, { Suspense, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useCategories } from '@/hooks/useCategories';
import { Colors } from '@/constants/theme';
import { SIZES } from '@/constants/sizes';
import { getCategoryIcon } from '@/utils/mapMarkers';

{
  /*
   * We need to load maps dynamically to avoid the "Metro error: window is not defined".
   */
}

const WebMap = React.lazy(() => import('@/components/map-container'));

export default function HomeScreen() {
  const [isMounted, setIsMounted] = useState(false);
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* KATEGORIE FILTER */}
      <View style={styles.categoriesFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs }}>
           <Pressable
            style={[styles.filterPill, !selectedCategoryId && styles.filterPillActive]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.filterText, !selectedCategoryId && styles.filterTextActive]}>Wszystkie</Text>
          </Pressable>
          {categories.map((cat) => (
             <Pressable
             key={cat.id}
             style={[styles.filterPill, selectedCategoryId === cat.id && styles.filterPillActive]}
             onPress={() => setSelectedCategoryId(cat.id)}
           >
             <Text style={[styles.filterText, selectedCategoryId === cat.id && styles.filterTextActive]}>
               {cat.name}
             </Text>
           </Pressable>
          ))}
        </ScrollView>
      </View>

      {Platform.OS === 'web' && isMounted ? (
        <Suspense
          fallback={
            <View style={styles.loading}>
              <Text>Ładowanie mapy...</Text>
            </View>
          }
        >
          <View style={styles.innerContainer}>
            <WebMap filterCategoryId={selectedCategoryId} />
          </View>
        </Suspense>
      ) : (
        <View style={styles.loading}>
          <Text>KIEDYŚ MOŻE MAPA NATYWNA</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  categoriesFilterContainer: {
    position: 'absolute',    
    top: SIZES.md,
    zIndex: 10,
    width: '100%'
  },
  filterPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius_pill,
    marginRight: SIZES.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  filterText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: SIZES.body_sm
  },
  filterTextActive: {
    color: Colors.white
  }
});